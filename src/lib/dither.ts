import { loadImageSource } from "@/lib/image-source";

/** Device pixels per halftone cell is set by the caller; this is the shader. */
const VERTEX_SOURCE = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;

uniform sampler2D uMask;
uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uRevealRadius;
uniform float uRevealSoftness;
uniform float uPixelSize;
uniform vec2 uResolution;
uniform float uBoxAspect;
uniform float uImageAspect;
uniform float uFit;
uniform vec3 uInk;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  float mask = texture2D(uMask, vUv).a;
  if (mask < 0.03) discard;

  float active = uMouseActive;

  // The letterforms only move while the pointer is on them.
  vec2 uv = vUv;
  float swell = sin(vUv.y * 9.0 + uTime * 1.6) * 0.6
              + sin(vUv.x * 6.0 - uTime * 1.1) * 0.4;
  uv += vec2(swell, swell * 0.5) * 0.016 * active;

  float ring = 0.0;
  if (active > 0.001) {
    float d = distance(vUv, uMouse);
    ring = sin(d * 30.0 - uTime * 4.0) * exp(-d * 4.0);
    uv += normalize(vUv - uMouse + 1e-5) * ring * 0.022 * active;
  }

  // Either crop the artwork into the wordmark, or squash the whole of it in —
  // for a gradient there are no shapes to distort, and nothing gets cut away.
  vec2 sampleUv = uv;
  if (uFit < 0.5) {
    if (uBoxAspect > uImageAspect) {
      sampleUv.y = (sampleUv.y - 0.5) * (uImageAspect / uBoxAspect) + 0.5;
    } else {
      sampleUv.x = (sampleUv.x - 0.5) * (uBoxAspect / uImageAspect) + 0.5;
    }
  }
  vec3 photo = texture2D(uImage, clamp(sampleUv, 0.0, 1.0)).rgb;

  // The artwork is colour on black. Key that black out, so tearing the
  // wordmark open only ever adds colour — the ink stays put where the artwork
  // has nothing to say, and no black is ever drawn.
  float presence = smoothstep(0.04, 0.28, max(max(photo.r, photo.g), photo.b));

  // At rest the wordmark is almost solid ink: the artwork only shows through as
  // a very sparse scatter of dark dots, denser where it runs dark.
  float bright = dot(photo, vec3(0.299, 0.587, 0.114));
  float coverage = mix(0.93, 1.0, bright);
  float tone = step(bayer8(gl_FragCoord.xy / max(uPixelSize, 0.5)), coverage);
  vec3 mono = mix(uInk * 0.24, uInk, tone);

  // The pointer tears the halftone open onto the colour beneath it.
  float revealPx = distance(vUv * uResolution, uMouse * uResolution);
  float inner = max(0.0, uRevealRadius * (1.0 - uRevealSoftness));
  float outer = uRevealRadius * (1.0 + uRevealSoftness) + 1.0;
  float reveal = (1.0 - smoothstep(inner, outer, revealPx)) * active;
  reveal = clamp(reveal + ring * 0.35 * active, 0.0, 1.0);

  gl_FragColor = vec4(mix(mono, photo, reveal * presence), mask);
}
`;

export interface DitherRenderer {
  resize(width: number, height: number, dpr: number): void;
  /** Alpha map of the letterforms, one texel per device pixel of the box. */
  setMask(source: TexImageSource): void;
  setImage(source: TexImageSource, width: number, height: number): void;
  setInk(rgb: [number, number, number]): void;
  /** True squashes the whole artwork into the box instead of cropping it. */
  setFit(fill: boolean): void;
  /** Pointer in 0..1 box coordinates, y running upward. */
  setPointer(x: number, y: number): void;
  setHovered(on: boolean): void;
  /** Reveal radius in device pixels. */
  setRevealRadius(pixels: number): void;
  frame(time: number): void;
  /** True once the pointer has left and the water has gone still. */
  isSettled(): boolean;
  dispose(): void;
}

export function createDitherRenderer(canvas: HTMLCanvasElement): DitherRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // One oversized triangle covers the box with less work than two.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const mask = gl.createTexture();
  const image = gl.createTexture();
  const prepare = (texture: WebGLTexture | null) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };
  prepare(mask);
  prepare(image);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uMask = u("uMask");
  const uImage = u("uImage");
  const uTime = u("uTime");
  const uMouse = u("uMouse");
  const uMouseActive = u("uMouseActive");
  const uRevealRadius = u("uRevealRadius");
  const uRevealSoftness = u("uRevealSoftness");
  const uPixelSize = u("uPixelSize");
  const uResolution = u("uResolution");
  const uBoxAspect = u("uBoxAspect");
  const uImageAspect = u("uImageAspect");
  const uFit = u("uFit");
  const uInk = u("uInk");
  gl.uniform1i(uMask, 0);
  gl.uniform1i(uImage, 1);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let mouseX = 0.5;
  let mouseY = 0.5;
  let active = 0;
  let target = 0;
  let imageAspect = 1;
  let pixelSize = 6;
  let revealRadius = 320;

  return {
    resize(width, height, dpr) {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      pixelSize = Math.max(2, 3 * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },

    setMask(source) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mask);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    },

    setImage(source, width, height) {
      if (!width || !height) return;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      imageAspect = width / height;
    },

    setInk(rgb) {
      gl.uniform3f(uInk, rgb[0], rgb[1], rgb[2]);
    },

    setFit(fill) {
      gl.uniform1f(uFit, fill ? 1 : 0);
    },

    setPointer(x, y) {
      mouseX = x;
      mouseY = y;
    },

    setHovered(on) {
      target = on ? 1 : 0;
    },

    setRevealRadius(pixels) {
      revealRadius = pixels;
    },

    frame(time) {
      active += (target - active) * 0.08;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mask);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, image);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uMouseActive, active);
      gl.uniform1f(uRevealRadius, revealRadius);
      gl.uniform1f(uRevealSoftness, 0.5);
      gl.uniform1f(uPixelSize, pixelSize);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uBoxAspect, canvas.width / canvas.height);
      gl.uniform1f(uImageAspect, imageAspect);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    isSettled() {
      return target === 0 && active < 0.004;
    },

    dispose() {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(mask);
      gl.deleteTexture(image);
    },
  };
}

/** The cover that fills the wordmark, fetched with CORS so it can be a texture. */
export function loadDitherCover(url: string, onLoad: (image: HTMLImageElement) => void) {
  loadImageSource(url, onLoad);
}
