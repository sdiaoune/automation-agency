import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    pillar: z.string(),
    keyword: z.string(),
    title: z.string(),
    seoTitle: z.string().optional(),
    meta: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    h1: z.string(),
    problem: z.string(),
    stakes: z.array(z.string()),
    system: z.array(z.string()),
    metrics: z.array(z.string()),
    cta: z.string(),
    bodySections: z.boolean().optional(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    ),
    relatedServices: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    relatedUseCases: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    related: z.array(z.string()),
    socialHook: z.string().optional(),
    socialImage: z.string().optional(),
  }),
});

export const collections = { blog };
