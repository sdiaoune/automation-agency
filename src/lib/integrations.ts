import { absoluteUrl, organizationSchema, siteUrl, websiteSchema } from "./site";

export interface IntegrationPage {
  slug: string;
  name: string;
  logo: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  workflows: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const integrationPages: IntegrationPage[] = [
  {
    slug: "appfolio",
    name: "AppFolio",
    logo: "/assets/integrations/appfolio.png",
    title: "AppFolio automation for property managers",
    seoTitle: "AppFolio Automation for Property Managers",
    description:
      "Connect AppFolio-adjacent leasing, maintenance, communication, and CRM workflows with AI intake and automation.",
    summary:
      "EMC2Ops helps property teams build practical automation around AppFolio workflows, communication paths, and handoffs.",
    workflows: [
      "Missed-call and SMS lead capture before staff update records.",
      "Maintenance intake summaries routed to the team with useful context.",
      "Owner and resident update workflows based on operational status.",
      "Task and note handoffs through supported APIs, webhooks, or middleware.",
    ],
    faqs: [
      {
        question: "Does EMC2Ops replace AppFolio?",
        answer: "No. EMC2Ops builds workflows around your operating stack so AppFolio and related systems receive cleaner context and fewer manual updates.",
      },
      {
        question: "Can every AppFolio field be automated?",
        answer: "Field-level automation depends on your AppFolio setup, permissions, available APIs, and the middleware used in the workflow.",
      },
    ],
  },
  {
    slug: "buildium",
    name: "Buildium",
    logo: "/assets/integrations/buildium.png",
    title: "Buildium automation for property managers",
    seoTitle: "Buildium Automation for Property Managers",
    description:
      "Automate Buildium-adjacent leasing, maintenance, resident communication, owner updates, and workflow handoffs.",
    summary:
      "EMC2Ops designs AI intake and workflow automation around Buildium processes so property teams spend less time chasing details.",
    workflows: [
      "Leasing inquiry capture and follow-up routing.",
      "Maintenance request detail collection before team review.",
      "Owner update drafts and approval paths.",
      "CRM, task, and notification handoffs through supported integration paths.",
    ],
    faqs: [
      {
        question: "Can Buildium workflows include human approval?",
        answer: "Yes. Approval steps are recommended for owner-facing updates, repair approvals, policy-sensitive issues, and unusual resident conversations.",
      },
      {
        question: "What does EMC2Ops need to scope a Buildium workflow?",
        answer: "We review the current trigger, where data should land, the required fields, permission constraints, and how exceptions should route.",
      },
    ],
  },
  {
    slug: "leadsimple",
    name: "LeadSimple",
    logo: "/assets/integrations/leadsimple.png",
    title: "LeadSimple automation for property managers",
    seoTitle: "LeadSimple Automation for Property Managers",
    description:
      "Use AI and workflow automation to improve LeadSimple lead capture, follow-up, task creation, and owner acquisition handoffs.",
    summary:
      "EMC2Ops helps property managers connect inbound communication and follow-up workflows to LeadSimple so prospects and owners do not stall.",
    workflows: [
      "Missed-call text-back for new owner or renter inquiries.",
      "Lead qualification and source context before sales follow-up.",
      "Task creation and pipeline handoffs for stale or high-intent leads.",
      "Owner acquisition workflows that keep response speed visible.",
    ],
    faqs: [
      {
        question: "Can LeadSimple workflows support owner acquisition?",
        answer: "Yes. The same intake, routing, reminder, and CRM update patterns can support owner leads and renter leads.",
      },
      {
        question: "Can EMC2Ops help with stale leads?",
        answer: "Yes. We can design reactivation sequences with stop rules, CRM updates, and escalation when a lead replies.",
      },
    ],
  },
];

export function integrationUrl(integration: IntegrationPage) {
  return `/integrations/${integration.slug}/`;
}

export function integrationSchema(integration: IntegrationPage) {
  const url = absoluteUrl(integrationUrl(integration));
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: integration.title,
        description: integration.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: {
          "@type": "SoftwareApplication",
          name: integration.name,
          applicationCategory: "Property management software",
        },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "en-US",
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `${integration.name} workflow automation for property managers`,
        provider: { "@id": `${siteUrl}/#organization` },
        serviceType: "Property management workflow automation",
        description: integration.summary,
        areaServed: "United States",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Integrations", item: `${siteUrl}/integrations/` },
          { "@type": "ListItem", position: 3, name: integration.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: integration.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}
