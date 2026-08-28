import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyBlogDeployBaseline } from "../scripts/verify-blog-deploy-baseline.mjs";

const page = ({ hero = "Protected hero", results = "Protected results", extra = "Local article list", css = "/_astro/home.css" } = {}) => `<!doctype html>
<html><head><link rel="stylesheet" href="${css}"></head><body>
  <section class="hero"><h1>${hero}</h1></section>
  <aside class="customer-results"><p>${results}</p></aside>
  <section class="latest-posts">${extra}</section>
</body></html>`;

async function withFixture({ livePage, liveCss, localPage, localCss }, run) {
  const distDir = await mkdtemp(path.join(os.tmpdir(), "emc2ops-blog-guard-"));
  await mkdir(path.join(distDir, "_astro"), { recursive: true });
  await writeFile(path.join(distDir, "index.html"), localPage);
  await writeFile(path.join(distDir, "_astro", "home.css"), localCss);

  const server = createServer((request, response) => {
    if (request.url === "/_astro/home.css") {
      response.setHeader("content-type", "text/css");
      response.end(liveCss);
      return;
    }

    response.setHeader("content-type", "text/html");
    response.end(livePage);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;

  try {
    await run({ distDir, origin });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(distDir, { recursive: true, force: true });
  }
}

test("allows blog-only changes outside protected homepage regions", async () => {
  await withFixture({
    livePage: page({ extra: "Old article list" }),
    localPage: page({ extra: "New article list" }),
    liveCss: ".hero { min-height: calc(100svh - 57px); }",
    localCss: ".hero{min-height:calc(100svh - 57px)}",
  }, async ({ distDir, origin }) => {
    const result = await verifyBlogDeployBaseline({ distDir, origin });
    assert.deepEqual(result, { protectedRegions: 2, stylesheets: 1 });
  });
});

test("blocks a blog deploy that changes the production hero", async () => {
  await withFixture({
    livePage: page(),
    localPage: page({ hero: "Regressed hero" }),
    liveCss: ".hero { min-height: 100svh; }",
    localCss: ".hero { min-height: 100svh; }",
  }, async ({ distDir, origin }) => {
    await assert.rejects(
      verifyBlogDeployBaseline({ distDir, origin }),
      /homepage hero differs from production/,
    );
  });
});

test("blocks a blog deploy that changes homepage layout CSS", async () => {
  await withFixture({
    livePage: page(),
    localPage: page(),
    liveCss: ".hero { min-height: calc(100svh - 57px); }",
    localCss: ".hero { padding: 84px 0 62px; }",
  }, async ({ distDir, origin }) => {
    await assert.rejects(
      verifyBlogDeployBaseline({ distDir, origin }),
      /homepage stylesheet bundle differs from production/,
    );
  });
});
