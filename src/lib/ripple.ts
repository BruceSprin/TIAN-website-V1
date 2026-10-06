/**
 * A water surface drawn over an image: slow standing swells, plus rings that
 * spread from wherever the cursor passes. The whole thing is one fragment
 * shader, so the "waves" are really just a displaced lookup into the cover.
 *
 * One canvas and one WebGL context serve the entire page. A page can hold a
 * dozen covers, and browsers cap how many live contexts a document may own, so
 * the canvas moves into whichever cover is hovered and is detached again when
 * the pointer leaves.
 */

/** How many cursor rings can be alive at once. */
const MAX_RIPPLES = 8;
/** Seconds a cursor ring takes to die away. */
const RIPPLE_LIFE = 2.2;

const VERTEX_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uImage;
uniform float uTime;
uniform float uIntensity;
uniform float uImageAspect;
uniform float uBoxAspect;
uniform vec3 uRipples[${MAX_RIPPLES}];

void main() {
  vec2 uv = vUv;
  vec2 shift = vec2(0.0);
  float glint = 0.0;

  // Standing water: crossed swells, a little stronger near the surface.
  float swell = 0.0016 + 0.0032 * (1.0 - uv.y);
  float wave = sin(uv.x * 26.0 + uTime * 1.7) * 0.6
             + sin(uv.y * 34.0 - uTime * 1.15) * 0.5
             + sin((uv.x + uv.y) * 17.0 + uTime * 0.9) * 0.4;
  shift += vec2(wave, wave * 0.6) * swell;

  // Rings thrown out by the cursor.
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec3 ripple = uRipples[i];
    if (ripple.z < 0.0) continue;
    float age = uTime - ripple.z;
    if (age < 0.0 || age > ${RIPPLE_LIFE}) continue;
    float dist = distance(uv, ripple.xy);
    float ring = sin(dist * 70.0 - age * 9.0) * exp(-age * 1.6) * exp(-dist * 6.0);
    shift += normalize(uv - ripple.xy + 1e-5) * ring * 0.012;
    glint += ring * exp(-dist * 4.0);
  }

  uv += shift * uIntensity;

  // object-cover: crop the image to the box rather than stretching it.
  if (uBoxAspect > uImageAspect) {
    uv.y = (uv.y - 0.5) * (uImageAspect / uBoxAspect) + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * (uBoxAspect / uImageAspect) + 0.5;
  }

  vec3 color = texture2D(uImage, clamp(uv, 0.0, 1.0)).rgb;
  color += vec3(0.45, 0.72, 1.0) * glint * 0.22 * uIntensity;
  gl_FragColor = vec4(color, 1.0);
}
`;

export interface RippleRenderer {
  /** Uploads an image as the texture the shader displaces. */
  setSource(source: TexImageSource, width: number, height: number): void;
  /** Sizes the drawing buffer to the box it is about to cover. */
  resize(width: number, height: number, dpr: number): void;
  /** Adds a ring at a point in 0..1 box coordinates, with y running upward. */
  moveTo(x: number, y: number, time: number): void;
  /** Forgets the cursor trail — used when the canvas moves to another cover. */
  reset(): void;
  setIntensity(value: number): void;
  frame(time: number): void;
}

function createRenderer(canvas: HTMLCanvasElement): RippleRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const uImage = gl.getUniformLocation(program, "uImage");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uIntensity = gl.getUniformLocation(program, "uIntensity");
  const uImageAspect = gl.getUniformLocation(program, "uImageAspect");
  const uBoxAspect = gl.getUniformLocation(program, "uBoxAspect");
  const uRipples = gl.getUniformLocation(program, "uRipples[0]");
  gl.uniform1i(uImage, 0);

  const ripples = new Float32Array(MAX_RIPPLES * 3).fill(-1);
  let head = 0;
  let lastX = -1;
  let lastY = -1;
  let lastTime = -10;
  let imageAspect = 1;
  let intensity = 0;

  return {
    setSource(source, width, height) {
      if (!width || !height) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      imageAspect = width / height;
    },

    resize(width, height, dpr) {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },

    moveTo(x, y, time) {
      // One ring per nudge of the pointer, so a slow drag still ripples.
      const far = Math.hypot(x - lastX, y - lastY) > 0.05;
      if (time - lastTime < 0.07) return;
      if (!far && time - lastTime < 0.4) return;
      lastX = x;
      lastY = y;
      lastTime = time;
      ripples[head * 3] = x;
      ripples[head * 3 + 1] = y;
      ripples[head * 3 + 2] = time;
      head = (head + 1) % MAX_RIPPLES;
    },

    reset() {
      ripples.fill(-1);
      head = 0;
      lastX = -1;
      lastY = -1;
      lastTime = -10;
      intensity = 0;
    },

    setIntensity(value) {
      intensity = value;
    },

    frame(time) {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uImageAspect, imageAspect);
      gl.uniform1f(uBoxAspect, canvas.width / canvas.height);
      gl.uniform3fv(uRipples, ripples);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

let shared: { canvas: HTMLCanvasElement; renderer: RippleRenderer } | null = null;

/** The page's one ripple canvas, created on first use. */
export function acquireRipple() {
  if (shared) return shared;
  const canvas = document.createElement("canvas");
  const renderer = createRenderer(canvas);
  if (!renderer) return null;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 500ms ease-out",
  });
  shared = { canvas, renderer };
  return shared;
}
