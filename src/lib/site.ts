import type { CollectionEntry } from "astro:content";

export const siteUrl = "https://www.emc2ops.com";
export const siteName = "EMC2Ops";
export const today = "2026-06-01";
export const defaultSocialImage = "/blog/social-assets/stop-losing-leads-after-hours.png";
export const socialImageDimensions = { width: 1672, height: 941 };
export const cities =
  "Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami";

export type BlogPost = CollectionEntry<"blog">;

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

export function articleTitleTag(post: BlogPost) {
  const raw = `${post.data.title} | EMC2Ops`;
  return raw.length > 62 ? `${post.data.title.replace(/:.*$/, "")} | EMC2Ops` : raw;
}

export function socialImageFor(post?: BlogPost) {
  return absoluteUrl(post?.data.socialImage || defaultSocialImage);
}

export function byOrder(posts: BlogPost[]) {
  return [...posts].sort((left, right) => left.data.order - right.data.order);
}

export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "EMC2Ops",
        alternateName: "EMC2 Ops",
        url: `${siteUrl}/`,
        sameAs: [
          "https://www.linkedin.com/company/emc2ops/",
          "https://www.youtube.com/@EMC2Ops",
          "https://x.com/EMC2Ops",
          "https://www.instagram.com/emc2ops_official/",
        ],
        description: "EMC2Ops builds AI automation workflows for property managers.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "EMC2Ops",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: "EMC2Ops | Done-for-You AI Front Desk for Property Managers",
        description:
          "EMC2Ops installs AI front desk workflows for property managers: missed-call text-back, leasing follow-up, maintenance intake, owner updates, vendor routing, and CRM logging.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#service` },
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#service`,
        name: "Done-for-you AI front desk for property managers",
        serviceType: "AI voice, SMS, and CRM workflow automation implementation",
        provider: { "@id": `${siteUrl}/#organization` },
        description:
          "Done-for-you implementation of missed-call recovery, leasing follow-up, tenant communication, maintenance intake, appointment routing, owner updates, vendor routing, and CRM logging.",
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq-schema`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How fast can this go live?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "The starter missed-call and follow-up workflow is designed to launch in about 7 days after access, copy, CRM details, and call or SMS requirements are confirmed.",
            },
          },
          {
            "@type": "Question",
            name: "Does this replace my team?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "No. It handles repetitive intake, qualification, routing, reminders, and logging so the property team can focus on higher-value conversations.",
            },
          },
          {
            "@type": "Question",
            name: "Can it connect to my CRM?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Most CRMs can be supported through native integrations, APIs, Zapier, Make, n8n, webhooks, or custom database workflows.",
            },
          },
          {
            "@type": "Question",
            name: "Can it handle maintenance requests?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. The AI can collect the issue, urgency, property or unit information, photos or links when supported, and route the request to the team or vendor process.",
            },
          },
        ],
      },
    ],
  };
}

export function blogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "EMC2Ops", url: `${siteUrl}/` },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/blog/#webpage`,
        url: `${siteUrl}/blog/`,
        name: "Property Management Automation Blog",
        description:
          "SEO guides for property managers on missed calls, leasing automation, maintenance intake, CRM workflow automation, and SMS compliance.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/blog/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
        ],
      },
    ],
  };
}

export function articleSchema(post: BlogPost) {
  const url = `${siteUrl}/blog/${post.data.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "EMC2Ops",
        url: `${siteUrl}/`,
        sameAs: [
          "https://www.linkedin.com/company/emc2ops/",
          "https://www.youtube.com/@EMC2Ops",
          "https://x.com/EMC2Ops",
          "https://www.instagram.com/emc2ops_official/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "EMC2Ops",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.data.title,
        description: post.data.meta,
        datePublished: today,
        dateModified: today,
        author: { "@id": `${siteUrl}/#organization` },
        publisher: { "@id": `${siteUrl}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: ["property management automation", post.data.keyword, post.data.pillar],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: post.data.title,
        description: post.data.meta,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
          { "@type": "ListItem", position: 3, name: post.data.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: post.data.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}
