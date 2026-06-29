import fs from "node:fs";
import path from "node:path";

export const contentPostsPath = "src/content/blog";

const reservedMoneyPageKeywords = new Map([
  ["apartment lead tracking", "/use-cases/apartment-lead-tracking/"],
  ["multifamily lead tracking", "/use-cases/apartment-lead-tracking/"],
  ["lead-to-lease automation", "/use-cases/lead-to-lease-automation/"],
  ["lead to lease", "/use-cases/lead-to-lease-automation/"],
  ["property management automation", "/use-cases/how-to-automate-property-management/"],
  ["how to automate property management", "/use-cases/how-to-automate-property-management/"],
  ["buildium integration", "/integrations/buildium/"],
  ["buildium integrations", "/integrations/buildium/"],
]);

function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return JSON.parse(trimmed.replace(/^'|'$/g, '"'));
  }
  return trimmed;
}

function parseFrontmatter(raw, filePath) {
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontmatter) throw new Error(`Missing frontmatter: ${filePath}`);

  const data = {};
  const lines = frontmatter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;

    const scalar = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!scalar) continue;

    const [, key, rawValue] = scalar;
    if (rawValue) {
      data[key] = parseScalar(rawValue);
      continue;
    }

    const items = [];
    while (lines[index + 1]?.startsWith("  - ")) {
      index += 1;
      const itemLine = lines[index].slice(4);
      if (/^[A-Za-z0-9_-]+:\s*/.test(itemLine)) {
        const object = {};
        const [firstKey, ...firstValueParts] = itemLine.split(":");
        object[firstKey.trim()] = parseScalar(firstValueParts.join(":"));

        while (lines[index + 1]?.startsWith("    ")) {
          index += 1;
          const nested = lines[index].trim();
          const [nestedKey, ...nestedValueParts] = nested.split(":");
          object[nestedKey.trim()] = parseScalar(nestedValueParts.join(":"));
        }

        items.push(object);
      } else {
        items.push(parseScalar(itemLine));
      }
    }
    data[key] = items;
  }

  return data;
}

function normalizeKeyword(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function postLinksTo(post, href) {
  const pools = [
    post.body || "",
    JSON.stringify(post.relatedUseCases || []),
    JSON.stringify(post.relatedServices || []),
  ];

  return pools.some((value) => value.includes(href));
}

export function readBlogPosts({ includeBody = false } = {}) {
  if (!fs.existsSync(contentPostsPath)) {
    throw new Error(`Blog content directory not found: ${contentPostsPath}`);
  }

  return fs
    .readdirSync(contentPostsPath)
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const filePath = path.join(contentPostsPath, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      const data = parseFrontmatter(raw, filePath);
      const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
      return {
        ...data,
        body: includeBody ? body : undefined,
        filePath,
      };
    })
    .sort((left, right) => {
      const order = Number(left.order || 0) - Number(right.order || 0);
      return order || String(left.slug).localeCompare(String(right.slug));
    });
}

export function validateBlogPosts(posts = readBlogPosts({ includeBody: true })) {
  const requiredFields = [
    "slug",
    "order",
    "pillar",
    "keyword",
    "title",
    "meta",
    "h1",
    "problem",
    "stakes",
    "system",
    "metrics",
    "cta",
    "faqs",
    "related",
  ];
  const errors = [];
  const slugs = new Set();

  for (const post of posts) {
    for (const field of requiredFields) {
      if (
        post[field] === undefined ||
        post[field] === "" ||
        (Array.isArray(post[field]) && post[field].length === 0)
      ) {
        errors.push(`${post.filePath}: missing ${field}`);
      }
    }

    if (slugs.has(post.slug)) errors.push(`${post.filePath}: duplicate slug ${post.slug}`);
    slugs.add(post.slug);

    for (const slug of post.related || []) {
      if (!slugs.has(slug) && !posts.some((candidate) => candidate.slug === slug)) {
        errors.push(`${post.filePath}: related slug not found: ${slug}`);
      }
    }

    const reservedTarget = reservedMoneyPageKeywords.get(normalizeKeyword(post.keyword));
    if (reservedTarget && !postLinksTo(post, reservedTarget)) {
      errors.push(
        `${post.filePath}: reserved money-page keyword "${post.keyword}" must link to ${reservedTarget}.`
      );
    }

    if (post.socialImage && !fs.existsSync(path.join("public", post.socialImage))) {
      errors.push(`${post.filePath}: social image not found: ${post.socialImage}`);
    }
  }

  return errors;
}

function postSummary(post) {
  return {
    slug: post.slug,
    pillar: post.pillar,
    keyword: post.keyword,
    title: post.title,
    meta: post.meta,
  };
}

function main() {
  const flags = new Set(process.argv.slice(2));
  const posts = readBlogPosts({ includeBody: !flags.has("--json") });

  if (flags.has("--json")) {
    console.log(JSON.stringify(posts.map(postSummary), null, 2));
    return;
  }

  const errors = validateBlogPosts(posts);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${posts.length} Astro blog posts.`);
  if (flags.has("--list")) {
    for (const post of posts) console.log(`${post.order}. ${post.slug} - ${post.title}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
