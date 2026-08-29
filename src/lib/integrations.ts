import { absoluteUrl, organizationSchema, siteUrl, websiteSchema } from "./site";
import { auditHref, type AuditCta, type BeforeAfter, type InstallableItem } from "./conversion";

export interface IntegrationPage {
  slug: string;
  name: string;
  logo: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  auditFocus: string;
  auditCta: AuditCta;
  supportedWorkflows: string[];
  workflows: string[];
  accessNotes: string[];
  fallbackPaths: string[];
  auditPrep: string[];
  installables: InstallableItem[];
  beforeAfter: BeforeAfter;
  bestFit: string[];
  notFit: string[];
  relatedServices: Array<{ label: string; href: string }>;
  relatedUseCases: Array<{ label: string; href: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const integrationPages: IntegrationPage[] = [
  {
    slug: "appfolio",
    name: "AppFolio",
    logo: "/assets/integrations/appfolio.png",
    title: "AppFolio workflow integration",
    seoTitle: "AppFolio Workflow Integration",
    description:
      "Scope an AppFolio workflow integration for leasing, maintenance, communication, CRM tasks, and safe API, middleware, inbox, or review handoffs.",
    summary:
      "EMC2Ops maps each AppFolio workflow integration to the available connection path, required fields, fallback route, and human review gates.",
    auditFocus:
      "We review which AppFolio-adjacent workflows can use API, middleware, webhooks, inbox parsing, forms, or human review based on your account access and target fields.",
    auditCta: {
      label: "Book my AppFolio workflow audit",
      title: "Want AppFolio-adjacent workflows without brittle workarounds?",
      body: "We will map the workflow, required data, access limits, fallback route, and review gates before recommending the connection path.",
    },
    supportedWorkflows: [
      "Leasing lead capture and follow-up",
      "Maintenance intake and routing",
      "Owner update drafting and approval",
      "CRM notes, tasks, and operational handoffs",
    ],
    workflows: [
      "Missed-call and SMS lead capture before staff update records.",
      "Maintenance intake summaries routed to the team with useful context.",
      "Owner and resident update workflows based on operational status.",
      "Task and note handoffs through supported APIs, webhooks, or middleware.",
    ],
    accessNotes: [
      "Available automation depends on your AppFolio permissions, configured modules, export options, and supported integration paths.",
      "Some workflows can write directly through approved API or middleware routes; others should use review queues or inbox-based handoffs.",
      "Sensitive updates, financial decisions, and owner-facing messages should keep human approval unless your policy says otherwise.",
    ],
    fallbackPaths: [
      "Email or inbox parsing for lead, maintenance, and owner-update events when direct access is limited.",
      "Forms or intake links to collect missing context before a team member updates AppFolio.",
      "Middleware such as Zapier, Make, n8n, or custom webhooks when supported by the surrounding tools.",
      "Human review queues for status changes that cannot be written safely or automatically.",
    ],
    auditPrep: [
      "Current AppFolio workflow screenshots or field names.",
      "The trigger that should start the automation.",
      "Required destination fields, notes, tasks, or owner-visible updates.",
      "Examples of exceptions that should stop automation.",
    ],
    installables: [
      {
        title: "Connection path",
        description: "API, middleware, inbox, form, or review queue selected from the workflow need and available access.",
      },
      {
        title: "Data capture",
        description: "Property, resident or prospect identity, status, owner, urgency, source, and next action.",
      },
      {
        title: "Workflow automation",
        description: "Follow-up, intake, routing, summaries, reminders, tasks, and review queues around AppFolio-adjacent steps.",
      },
      {
        title: "Writebacks",
        description: "Supported notes, tasks, summaries, status updates, or handoff records written through the safest available route.",
      },
      {
        title: "Stop rules",
        description: "Controls for staff takeover, limited permissions, duplicate records, sensitive updates, and unclear data.",
      },
      {
        title: "Escalation path",
        description: "Human review for owner-facing updates, repair approvals, complaints, payments, and unusual resident issues.",
      },
    ],
    beforeAfter: {
      before: [
        "Teams copy details between communication tools and AppFolio workflows.",
        "Automation ideas stall because direct access is unclear.",
        "Exceptions and owner-sensitive updates are handled inconsistently.",
      ],
      after: [
        "Each workflow has a chosen connection path and fallback route.",
        "Staff receive cleaner summaries and fewer manual handoffs.",
        "Sensitive steps route to review before anything is sent or logged.",
      ],
    },
    bestFit: [
      "You use AppFolio as part of the operating record but communication starts elsewhere.",
      "You need a practical connection plan before promising direct field updates.",
      "You are open to API, middleware, inbox parsing, or human review depending on access.",
    ],
    notFit: [
      "You need guaranteed direct writes to every AppFolio field before access is verified.",
      "You want automation to bypass permissions or approval policies.",
      "You are not ready to provide workflow examples or destination-field requirements.",
    ],
    relatedServices: [
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "Maintenance intake automation", href: "/services/maintenance-intake-automation/" },
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
    ],
    relatedUseCases: [
      { label: "How to automate property management", href: "/use-cases/how-to-automate-property-management/" },
      { label: "Lead-to-lease automation", href: "/use-cases/lead-to-lease-automation/" },
      { label: "CRM follow-up cleanup", href: "/use-cases/real-estate-crm-follow-up-mess/" },
    ],
    faqs: [
      {
        question: "What is AppFolio automation for property managers?",
        answer: "AppFolio automation for property managers is the process of connecting leasing, maintenance, owner update, communication, task, note, and CRM handoff workflows around AppFolio based on the access paths your account and surrounding tools support.",
      },
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
    title: "Buildium workflow automation integration",
    seoTitle: "Buildium Workflow Automation Integration",
    description:
      "Scope a Buildium workflow automation integration for leasing, maintenance, owner updates, CRM tasks, and supported API or middleware handoffs.",
    summary:
      "EMC2Ops maps each Buildium workflow automation integration to verified access, required fields, fallback paths, human approvals, and safe writebacks.",
    auditFocus:
      "We verify where a Buildium integration can use Buildium API, Buildium Open API, middleware, inbox parsing, forms, or review queues before defining automations and writebacks.",
    auditCta: {
      label: "Book my Buildium integration audit",
      title: "Want a Buildium integration plan that matches your access?",
      body: "We will review the workflow, Buildium API or Buildium Open API availability, destination fields, fallback paths, and human approval points.",
    },
    supportedWorkflows: [
      "Buildium integrations for leasing inquiry and follow-up",
      "Buildium integration handoffs for maintenance intake",
      "Owner update drafts and approval queues",
      "Tasks, notes, notifications, and exception routing around Buildium",
    ],
    workflows: [
      "Leasing inquiry capture, source tracking, and follow-up routing before prospects go stale.",
      "Maintenance request detail collection with urgency, access, photo, and owner-approval context before team review.",
      "Owner update drafts, approval paths, and logging rules for sensitive status changes.",
      "Task, note, CRM, notification, and exception handoffs through supported Buildium API access, Buildium Open API access, webhooks, middleware, or inbox-based workflows.",
    ],
    accessNotes: [
      "Buildium API and Buildium Open API availability depend on account permissions, enabled access, endpoint coverage, and the data each workflow needs.",
      "Some Buildium integrations can use direct API or middleware paths; others should use forms, inbox parsing, task handoffs, or human approval queues.",
      "Owner-facing, financial, repair-approval, and policy-sensitive workflows should keep review gates unless your team explicitly approves automation rules.",
    ],
    fallbackPaths: [
      "Inbox or notification parsing for lead, maintenance, owner, and task events when direct API access is not enough.",
      "Structured forms to collect missing fields before staff or middleware update Buildium.",
      "Middleware such as Zapier, Make, n8n, webhooks, or custom scripts when surrounding tools expose the needed trigger.",
      "Human review queues when a Buildium field cannot be written safely or an approval is required.",
    ],
    auditPrep: [
      "The Buildium workflow you want to improve and where it starts today.",
      "Known Buildium API or Buildium Open API access details, if available.",
      "Examples of required fields, notes, tasks, and status updates.",
      "Exceptions that should route to staff before any message or update is sent.",
    ],
    installables: [
      {
        title: "Buildium connection map",
        description: "API, Buildium Open API, middleware, inbox, form, or review queue path selected after access is verified.",
      },
      {
        title: "Data captured",
        description: "Property, person, unit, source, status, urgency, owner, approval need, and next action.",
      },
      {
        title: "Buildium-adjacent automations",
        description: "Follow-up, intake, routing, reminders, drafts, task creation, and review queues tied to your Buildium workflows.",
      },
      {
        title: "Writebacks",
        description: "Supported tasks, notes, notifications, summaries, or status handoffs through the safest available Buildium integration route.",
      },
      {
        title: "Stop rules",
        description: "Guards for permissions, duplicate updates, staff takeover, opted-out contacts, approvals, and unavailable fields.",
      },
      {
        title: "Escalation paths",
        description: "Human review for owner updates, maintenance approvals, financial issues, resident complaints, and unusual exceptions.",
      },
    ],
    beforeAfter: {
      before: [
        "Teams talk about Buildium integrations without knowing which access path is realistic.",
        "Staff copy maintenance, leasing, and owner context between tools.",
        "Sensitive updates risk being automated without enough approval context.",
      ],
      after: [
        "The Buildium integration path is chosen based on real access and workflow needs.",
        "Automations collect context before tasks, notes, or handoffs are created.",
        "Fallback and review paths keep the workflow useful even when direct API coverage is limited.",
      ],
    },
    bestFit: [
      "You want Buildium integrations that are scoped around actual account access.",
      "Your team spends time moving leasing, maintenance, or owner-update context into Buildium.",
      "You need a fallback plan if Buildium API or Buildium Open API coverage does not fit every step.",
    ],
    notFit: [
      "You require direct Buildium API writes before access and endpoint coverage are confirmed.",
      "You want automation to bypass Buildium permissions, approval rules, or policy review.",
      "You cannot provide a target workflow, example records, or required destination fields.",
    ],
    relatedServices: [
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "Maintenance intake automation", href: "/services/maintenance-intake-automation/" },
      { label: "Owner update automation", href: "/services/owner-update-automation/" },
    ],
    relatedUseCases: [
      { label: "Lead-to-lease automation", href: "/use-cases/lead-to-lease-automation/" },
      { label: "How to automate property management", href: "/use-cases/how-to-automate-property-management/" },
      { label: "Apartment lead tracking", href: "/use-cases/apartment-lead-tracking/" },
    ],
    faqs: [
      {
        question: "What is Buildium integration automation?",
        answer: "Buildium integration automation connects Buildium-adjacent leasing, maintenance, owner update, task, note, notification, and CRM workflows through the safest available API, middleware, inbox, form, or review-queue path.",
      },
      {
        question: "Can EMC2Ops connect workflows to Buildium?",
        answer: "Yes, when the workflow can be supported by your Buildium setup, permissions, available APIs, webhooks, middleware, or approved handoff path.",
      },
      {
        question: "Does this require the Buildium Open API?",
        answer: "Not always. Some workflows use API access, while others use middleware, email parsing, forms, task handoffs, or human approval queues depending on the data that needs to move.",
      },
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
    auditFocus:
      "We review LeadSimple pipeline stages, inbound triggers, task rules, owner or renter qualification, follow-up timing, and available integration paths.",
    auditCta: {
      label: "Book my LeadSimple workflow audit",
      title: "Want LeadSimple follow-up tied to real next steps?",
      body: "We will map where leads stall, which LeadSimple fields or tasks matter, and which automations can improve ownership without creating noisy records.",
    },
    supportedWorkflows: [
      "Owner lead intake and speed-to-lead",
      "Renter inquiry routing and follow-up",
      "Stale lead reactivation",
      "Pipeline tasks, notes, summaries, and ownership handoffs",
    ],
    workflows: [
      "Missed-call text-back for new owner or renter inquiries.",
      "Lead qualification and source context before sales follow-up.",
      "Task creation and pipeline handoffs for stale or high-intent leads.",
      "Owner acquisition workflows that keep response speed visible.",
    ],
    accessNotes: [
      "LeadSimple automation depends on your pipeline setup, permissions, available fields, and integration or middleware access.",
      "Some workflows can update tasks, notes, or stages directly; others may use middleware or review queues first.",
      "Owner acquisition and renter follow-up paths should use different qualification, timing, and escalation rules.",
    ],
    fallbackPaths: [
      "Call, SMS, or inbox parsing to catch new inquiries before they become stale.",
      "Structured intake forms for owner or renter qualification details.",
      "Middleware such as Zapier, Make, n8n, or webhooks where supported.",
      "Human review queues for high-value owners, sensitive replies, or unclear pipeline ownership.",
    ],
    auditPrep: [
      "LeadSimple stages and the fields your team trusts today.",
      "Examples of stale leads, duplicate records, or missed follow-up tasks.",
      "Current lead sources and desired response windows.",
      "Rules for owner leads versus renter leads.",
    ],
    installables: [
      {
        title: "LeadSimple trigger map",
        description: "New lead, missed call, stale stage, reply, task due, or owner inquiry events that should start automation.",
      },
      {
        title: "Data captured",
        description: "Source, lead type, contact details, property or portfolio interest, urgency, owner, stage, and next step.",
      },
      {
        title: "Follow-up automations",
        description: "Speed-to-lead prompts, stale lead recovery, task creation, stage nudges, and owner acquisition handoffs.",
      },
      {
        title: "Writebacks",
        description: "Tasks, notes, summaries, stages, owner assignments, and sequence outcomes routed to LeadSimple where supported.",
      },
      {
        title: "Stop rules",
        description: "Controls for staff replies, booked calls, opt-outs, duplicate leads, disqualification, and high-value owner review.",
      },
      {
        title: "Escalation paths",
        description: "Human handoff for high-intent owner leads, pricing questions, complaints, and unclear pipeline ownership.",
      },
    ],
    beforeAfter: {
      before: [
        "New owner or renter leads wait for manual qualification.",
        "Stale pipeline stages rely on staff remembering the next touch.",
        "Tasks and notes do not explain why a lead needs attention.",
      ],
      after: [
        "LeadSimple follow-up starts from defined triggers and stages.",
        "High-intent leads get fast response while exceptions route to staff.",
        "Pipeline notes, tasks, and sequence outcomes stay easier to trust.",
      ],
    },
    bestFit: [
      "You use LeadSimple for owner acquisition, renter inquiries, or sales follow-up.",
      "You have stale stages, missed tasks, or speed-to-lead gaps.",
      "You want automation to support pipeline discipline without replacing staff judgment.",
    ],
    notFit: [
      "You want one generic sequence for owners, renters, and vendors.",
      "Your LeadSimple pipeline stages are not defined enough to trigger workflow rules.",
      "You need automation to make sales decisions without human review.",
    ],
    relatedServices: [
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
    ],
    relatedUseCases: [
      { label: "CRM follow-up cleanup", href: "/use-cases/real-estate-crm-follow-up-mess/" },
      { label: "Real estate lead follow-up automation", href: "/use-cases/real-estate-lead-follow-up-automation/" },
      { label: "Apartment lead tracking", href: "/use-cases/apartment-lead-tracking/" },
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
        potentialAction: {
          "@type": "ContactAction",
          target: `${siteUrl}${auditHref(integration.slug, "integration")}`,
          name: integration.auditCta.label,
        },
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
