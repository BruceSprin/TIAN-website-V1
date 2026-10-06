/**
 * Images the shaders may safely upload as textures. Covers come from a CDN,
 * and a texture uploaded from an image the browser did not fetch with CORS
 * would taint the canvas, so each shader gets its own copy. Loaded images are
 * kept, so asking twice costs nothing.
 */

const sources = new Map<string, HTMLImageElement>();

export function loadImageSource(url: string, onLoad: (image: HTMLImageElement) => void) {
  if (!url) return;
  const cached = sources.get(url);
  if (cached) {
    onLoad(cached);
    return;
  }
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    sources.set(url, image);
    onLoad(image);
  };
  image.src = url;
}
