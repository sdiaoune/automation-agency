import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.emc2ops.com",
  output: "static",
  trailingSlash: "always",
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx()],
});
