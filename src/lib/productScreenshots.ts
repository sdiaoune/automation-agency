import manifest from "../data/product-screenshot-manifest.json";

export interface ScreenshotSource {
  webp: string;
  jpeg: string;
  width: number;
  height: number;
}

export interface ProductScreenshot {
  route: string;
  scenario: string;
  section: string;
  desktop: ScreenshotSource;
  mobile: ScreenshotSource;
  alt: string;
}

const screenshots = manifest as ProductScreenshot[];
const byPath = new Map(screenshots.map((item) => [item.route, item]));

export function productScreenshotForPath(pathname: string): ProductScreenshot {
  const screenshot = byPath.get(pathname);
  if (!screenshot) throw new Error(`Missing PM Ops screenshot manifest entry for ${pathname}`);
  return screenshot;
}

export const productScreenshotRoutes = screenshots.map((item) => item.route);
