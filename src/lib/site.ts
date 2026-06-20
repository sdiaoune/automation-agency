import type { CollectionEntry } from "astro:content";

export const siteUrl = "https://www.emc2ops.com";
export const siteName = "EMC2Ops";
export const siteUpdatedAt = "2026-06-20";
export const defaultSocialImage = "/og-image.png";
export const socialImageDimensions = { width: 1672, height: 941 };
export const cities =
  "Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, and Miami";

const sameAs = [
  "https://www.linkedin.com/company/emc2ops/",
  "https://www.youtube.com/@EMC2Ops",
  "https://x.com/EMC2Ops",
  "https://www.instagram.com/emc2ops_official/",
];

const audience = {
  "@type": "BusinessAudience",
  audienceType: "Property management companies, multifamily operators, leasing teams, and maintenance coordinators",
};

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: "EMC2 Ops",
    url: `${siteUrl}/`,
    logo: absoluteUrl("/favicon.svg"),
    image: absoluteUrl(defaultSocialImage),
    sameAs,
    email: "hello@emc2ops.com",
    description:
      "EMC2Ops builds done-for-you AI front desk and workflow automation systems for property management companies.",
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: [
      "property management automation",
      "AI front desk workflows",
      "missed-call text-back",
      "leasing follow-up automation",
      "maintenance intake automation",
      "CRM workflow automation",
      "owner update automation",
      "vendor dispatch automation",
      "SMS compliance",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "hello@emc2ops.com",
        areaServed: "US",
        availableLanguage: "en",
      },
      {
        "@type": "ContactPoint",
        contactType: "security",
        email: "hello@emc2ops.com",
        areaServed: "US",
        availableLanguage: "en",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: siteName,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-US",
  };
}

function siteNavigationSchema() {
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}/#site-navigation`,
    name: "EMC2Ops primary navigation",
    itemListElement: [
      { "@type": "SiteNavigationElement", position: 1, name: "Services", url: `${siteUrl}/services/` },
      { "@type": "SiteNavigationElement", position: 2, name: "Use Cases", url: `${siteUrl}/use-cases/` },
      { "@type": "SiteNavigationElement", position: 3, name: "Integrations", url: `${siteUrl}/integrations/` },
      { "@type": "SiteNavigationElement", position: 4, name: "Blog", url: `${siteUrl}/blog/` },
      { "@type": "SiteNavigationElement", position: 5, name: "About", url: `${siteUrl}/about/` },
      { "@type": "SiteNavigationElement", position: 6, name: "Privacy", url: `${siteUrl}/privacy/` },
      { "@type": "SiteNavigationElement", position: 7, name: "Terms", url: `${siteUrl}/terms/` },
    ],
  };
}

export type BlogPost = CollectionEntry<"blog">;

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

export function articleTitleTag(post: BlogPost) {
  return `${post.data.seoTitle || post.data.title} | EMC2Ops`;
}

export function socialImageFor(post?: BlogPost) {
  return absoluteUrl(post?.data.socialImage || defaultSocialImage);
}

export function byOrder(posts: BlogPost[]) {
  return [...posts].sort((left, right) => left.data.order - right.data.order);
}

export function postUpdatedAt(post: BlogPost) {
  return post.data.updatedAt || post.data.publishedAt;
}

export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      siteNavigationSchema(),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: "EMC2Ops | Done-for-You AI Front Desk for Property Managers",
        description:
          "EMC2Ops installs AI front desk workflows for property managers: missed-call text-back, leasing follow-up, maintenance intake, and CRM logging.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#service` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(defaultSocialImage),
          width: socialImageDimensions.width,
          height: socialImageDimensions.height,
        },
        breadcrumb: { "@id": `${siteUrl}/#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/#breadcrumb`,
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` }],
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#service`,
        name: "Done-for-you AI front desk for property managers",
        serviceType: "AI voice, SMS, and CRM workflow automation implementation",
        provider: { "@id": `${siteUrl}/#organization` },
        description:
          "Done-for-you implementation of missed-call recovery, leasing follow-up, tenant communication, maintenance intake, appointment routing, owner updates, vendor routing, and CRM logging.",
        areaServed: { "@type": "Country", name: "United States" },
        audience,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Property management automation services",
          itemListElement: [
            "Missed-call recovery",
            "AI leasing follow-up automation",
            "Maintenance intake automation",
            "CRM workflow automation",
            "Owner update automation",
            "Vendor dispatch automation",
            "AI front desk implementation",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name,
              provider: { "@id": `${siteUrl}/#organization` },
            },
          })),
        },
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

export function blogIndexSchema(posts: BlogPost[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/blog/#webpage`,
        url: `${siteUrl}/blog/`,
        name: "Property Management Automation Blog",
        description:
          "SEO guides for property managers on missed calls, leasing automation, maintenance intake, CRM workflow automation, and SMS compliance.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: ["property management automation", "AI front desk workflows", "leasing automation"],
        inLanguage: "en-US",
        hasPart: [
          { "@type": "DataFeed", name: "EMC2Ops RSS feed", url: absoluteUrl("/feed.xml") },
          { "@type": "Dataset", name: "EMC2Ops blog post index", url: absoluteUrl("/blog/posts.json") },
        ],
      },
      posts.length > 0 && {
        "@type": "ItemList",
        "@id": `${siteUrl}/blog/#item-list`,
        name: "EMC2Ops property management automation articles",
        itemListElement: posts.slice(0, 25).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/blog/${post.data.slug}/`),
          name: post.data.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/blog/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
        ],
      },
    ].filter(Boolean),
  };
}

export function articleSchema(post: BlogPost) {
  const url = `${siteUrl}/blog/${post.data.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.data.title,
        description: post.data.meta,
        datePublished: post.data.publishedAt,
        dateModified: postUpdatedAt(post),
        image: socialImageFor(post),
        thumbnailUrl: socialImageFor(post),
        author: { "@id": `${siteUrl}/#organization` },
        publisher: { "@id": `${siteUrl}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: ["property management automation", post.data.keyword, post.data.pillar],
        keywords: [post.data.keyword, post.data.pillar, "property management automation", "AI front desk"],
        articleSection: post.data.pillar,
        inLanguage: "en-US",
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

export function legalPageSchema({
  path,
  title,
  description,
  pageType,
  updatedAt,
}: {
  path: string;
  title: string;
  description: string;
  pageType: "PrivacyPolicy" | "TermsOfService";
  updatedAt: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": ["WebPage", pageType],
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        dateModified: updatedAt,
        inLanguage: "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: title.replace(" | EMC2Ops", ""), item: url },
        ],
      },
    ],
  };
}

export function aboutPageSchema() {
  const url = absoluteUrl("/about/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: "About EMC2Ops",
        description:
          "EMC2Ops builds AI front desk and workflow automation systems for property management companies.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-US",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "About", item: url },
        ],
      },
    ],
  };
}
