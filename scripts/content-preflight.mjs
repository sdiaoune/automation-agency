import fs from "node:fs";
import path from "node:path";
import { readBlogPosts } from "./blog-content.mjs";

const reservedFamilies = [
  {
    phrases: ["apartment lead tracking", "multifamily lead tracking"],
    target: "/use-cases/apartment-lead-tracking/",
  },
  {
    phrases: ["lead-to-lease automation", "lead to lease"],
    target: "/use-cases/lead-to-lease-automation/",
  },
  {
    phrases: ["property management automation", "how to automate property management"],
    target: "/use-cases/how-to-automate-property-management/",
  },
  {
    phrases: ["buildium integration", "buildium integrations"],
    target: "/integrations/buildium/",
  },
  {
    phrases: ["leasing lead automation", "leasing follow-up automation"],
    target: "/services/leasing-follow-up/",
  },
  {
    phrases: ["apartment call tracking", "leasing call routing"],
    target: "/services/missed-call-recovery/",
  },
  {
    phrases: ["real estate crm cleanup", "property management crm cleanup", "crm follow-up cleanup"],
    target: "/use-cases/real-estate-crm-follow-up-mess/",
  },
  {
    phrases: ["appfolio workflow integration"],
    target: "/integrations/appfolio/",
  },
  {
    phrases: ["buildium workflow integration", "buildium workflow automation integration"],
    target: "/integrations/buildium/",
  },
];

const reservedPrimaryKeywords = new Map(
  reservedFamilies.flatMap((family) => family.phrases.map((phrase) => [normalizeText(phrase), family.target])),
);

function argsFromCli() {
  const args = new Map();
  const values = process.argv.slice(2);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];

    if (!next || next.startsWith("--")) {
      args.set(key, "true");
    } else {
      args.set(key, next);
      index += 1;
    }
  }

  return args;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  return String(value || "").match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length || 0;
}

function internalBlogLinks(value) {
  return [...String(value || "").matchAll(/\]\((\/blog\/[^)#?]+\/)(?:[#?][^)]*)?\)/g)].map(
    (match) => match[1],
  );
}

function linksTo(post, href) {
  return [
    post.body || "",
    JSON.stringify(post.relatedUseCases || []),
    JSON.stringify(post.relatedServices || []),
  ].some((value) => value.includes(href));
}

function publicPathFor(assetPath) {
  return path.join("public", String(assetPath || "").replace(/^\//, ""));
}

function main() {
  const args = argsFromCli();
  const slug = args.get("slug");
  if (!slug) {
    console.error("Pass --slug <blog-slug>.");
    process.exit(1);
  }

  const post = readBlogPosts({ includeBody: true }).find((candidate) => candidate.slug === slug);
  if (!post) {
    console.error(`Blog post not found: ${slug}`);
    process.exit(1);
  }

  const errors = [];
  const bodyWords = wordCount(post.body);
  const blogLinks = internalBlogLinks(post.body);
  const normalizedKeyword = normalizeText(post.keyword);
  const searchableText = normalizeText(
    [post.keyword, post.title, post.seoTitle, post.h1, post.problem, post.body].filter(Boolean).join(" "),
  );

  if (bodyWords < 900) errors.push(`${post.filePath}: body has ${bodyWords} words; expected at least 900.`);
  if (blogLinks.length < 6) {
    errors.push(`${post.filePath}: body has ${blogLinks.length} internal blog links; expected at least 6.`);
  }
  if (!(post.bodySections === true || post.bodySections === "true")) {
    errors.push(`${post.filePath}: bodySections must be true.`);
  }
  if (!post.socialHook) errors.push(`${post.filePath}: missing socialHook.`);
  if (!post.socialImage) {
    errors.push(`${post.filePath}: missing socialImage.`);
  } else if (!fs.existsSync(publicPathFor(post.socialImage))) {
    errors.push(`${post.filePath}: social image not found: ${post.socialImage}`);
  }

  const reservedTarget = reservedPrimaryKeywords.get(normalizedKeyword);
  if (reservedTarget) {
    errors.push(
      `${post.filePath}: primary keyword "${post.keyword}" is reserved for ${reservedTarget}; use a long-tail support keyword.`,
    );
  }

  for (const family of reservedFamilies) {
    const touchesFamily = family.phrases.some((phrase) => searchableText.includes(normalizeText(phrase)));
    if (touchesFamily && !linksTo(post, family.target)) {
      errors.push(`${post.filePath}: touches reserved cluster but does not link to ${family.target}.`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        slug: post.slug,
        bodyWords,
        internalBlogLinks: blogLinks.length,
        socialImage: post.socialImage,
        status: "passed",
      },
      null,
      2,
    ),
  );
}

main();
