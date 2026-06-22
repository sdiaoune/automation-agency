import { absoluteUrl, organizationSchema, siteUrl, websiteSchema } from "./site";

export interface ServicePage {
  slug: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  outcomes: string[];
  workflow: string[];
  metrics: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedUseCases: Array<{ label: string; href: string; description: string }>;
  relatedPosts: string[];
}

export const servicePages: ServicePage[] = [
  {
    slug: "missed-call-recovery",
    eyebrow: "Missed-call recovery",
    title: "Missed-call recovery for property managers",
    seoTitle: "Missed-Call Recovery for Property Managers",
    description:
      "Recover missed leasing calls with instant SMS follow-up, renter qualification, team alerts, and CRM logging.",
    summary:
      "EMC2Ops installs a missed-call workflow that responds in seconds, captures renter intent, and routes qualified prospects back into your leasing process.",
    outcomes: [
      "Text prospects back automatically after missed calls.",
      "Collect move date, unit interest, budget, pets, and showing intent.",
      "Create CRM notes, tasks, and team alerts from each qualified reply.",
    ],
    workflow: [
      "Inbound call is missed or goes unanswered.",
      "The prospect receives a branded text-back with a clear next step.",
      "AI captures the context your leasing team needs.",
      "Qualified leads are routed to the right staff member and logged in the CRM.",
    ],
    metrics: ["missed calls recovered", "time to first response", "qualified replies", "booked showings"],
    faqs: [
      {
        question: "How fast does missed-call recovery respond?",
        answer: "The workflow is designed to send the first SMS within seconds after the missed-call trigger is available.",
      },
      {
        question: "Can it stop when a human responds?",
        answer: "Yes. We design stop rules so automation does not fight the leasing team once a human takes over.",
      },
    ],
    relatedUseCases: [
      {
        label: "Apartment lead tracking",
        href: "/use-cases/apartment-lead-tracking/",
        description: "Capture renter source, qualification details, ownership, and booked-tour next steps.",
      },
      {
        label: "Real estate lead follow-up automation",
        href: "/use-cases/real-estate-lead-follow-up-automation/",
        description: "Recover missed or stale leasing inquiries with stage-aware follow-up.",
      },
      {
        label: "Lead-to-lease automation",
        href: "/use-cases/lead-to-lease-automation/",
        description: "Connect inquiry, tour, application, approval, and move-in handoff.",
      },
    ],
    relatedPosts: ["missed-call-text-back-property-management", "missed-leasing-calls-property-management"],
  },
  {
    slug: "leasing-follow-up",
    eyebrow: "Leasing follow-up",
    title: "AI leasing follow-up automation",
    seoTitle: "AI Leasing Follow-Up Automation",
    description:
      "Automate leasing follow-up across SMS, email, reminders, and CRM tasks so warm renter leads do not go cold.",
    summary:
      "EMC2Ops builds follow-up workflows that keep renter conversations moving after the first inquiry, missed tour, stale reply, or booked showing.",
    outcomes: [
      "Follow up with prospects who stopped replying.",
      "Send showing reminders, confirmations, and rebooking prompts.",
      "Update CRM stages when a prospect replies, books, no-shows, or opts out.",
    ],
    workflow: [
      "A renter lead enters your CRM, inbox, phone system, or form stack.",
      "The workflow chooses the right follow-up path based on status and timing.",
      "Prospects receive short, branded prompts to book, confirm, or reschedule.",
      "Replies and outcomes are synced back to the operating system of record.",
    ],
    metrics: ["lead-to-showing rate", "reply rate", "no-show recovery", "stale leads reactivated"],
    faqs: [
      {
        question: "Can the sequence use SMS and email?",
        answer: "Yes. The channel mix depends on your tools, consent language, and where the prospect entered the funnel.",
      },
      {
        question: "Will every lead receive the same message?",
        answer: "No. Strong workflows vary by stage, timing, source, and the last known prospect action.",
      },
    ],
    relatedUseCases: [
      {
        label: "Real estate lead follow-up automation",
        href: "/use-cases/real-estate-lead-follow-up-automation/",
        description: "Automate speed-to-lead, stale lead recovery, no-show follow-up, and handoff rules.",
      },
      {
        label: "Lead-to-lease automation",
        href: "/use-cases/lead-to-lease-automation/",
        description: "Keep every renter next step visible from first inquiry through move-in.",
      },
      {
        label: "Apartment lead tracking",
        href: "/use-cases/apartment-lead-tracking/",
        description: "Track lead source, renter fit, ownership, and CRM completion.",
      },
      {
        label: "CRM follow-up cleanup",
        href: "/use-cases/real-estate-crm-follow-up-mess/",
        description: "Fix messy stages, tasks, duplicate records, and follow-up ownership.",
      },
    ],
    relatedPosts: ["ai-leasing-follow-up-property-management", "reduce-showing-no-shows-property-management"],
  },
  {
    slug: "maintenance-intake-automation",
    eyebrow: "Maintenance intake",
    title: "Maintenance intake automation for property managers",
    seoTitle: "Maintenance Intake Automation",
    description:
      "Collect maintenance details, urgency, access notes, photos, and routing context before requests reach your team.",
    summary:
      "EMC2Ops installs maintenance intake workflows that gather better resident details and route requests with less back-and-forth.",
    outcomes: [
      "Capture issue type, location, urgency, access notes, and resident context.",
      "Separate emergencies from standard maintenance requests.",
      "Route clean summaries to coordinators, vendors, owners, or the CRM.",
    ],
    workflow: [
      "A resident submits a maintenance request by phone, text, form, or inbox.",
      "AI collects the missing details your team normally has to chase.",
      "Emergency and exception rules escalate sensitive requests.",
      "The final summary is routed into your maintenance workflow.",
    ],
    metrics: ["intake completion", "dispatch readiness", "manual follow-up avoided", "time to route"],
    faqs: [
      {
        question: "Can this handle emergency maintenance?",
        answer: "It can identify emergency indicators and escalate, but final emergency handling rules should match your operating policy.",
      },
      {
        question: "Can residents send photos?",
        answer: "Photo handling depends on the channel and tools in your stack, but the workflow can request and route photo links when supported.",
      },
    ],
    relatedUseCases: [
      {
        label: "How to automate property management",
        href: "/use-cases/how-to-automate-property-management/",
        description: "Choose the first measurable workflow and define the trigger, exception path, and final record.",
      },
      {
        label: "CRM follow-up cleanup",
        href: "/use-cases/real-estate-crm-follow-up-mess/",
        description: "Keep maintenance intake handoffs, follow-up tasks, and status updates out of messy CRM notes.",
      },
    ],
    relatedPosts: ["property-management-maintenance-intake-automation", "automate-tenant-maintenance-requests"],
  },
  {
    slug: "crm-workflow-automation",
    eyebrow: "CRM workflow automation",
    title: "CRM workflow automation for property managers",
    seoTitle: "Property Management CRM Automation",
    description:
      "Sync calls, texts, notes, tasks, statuses, and summaries into your property management CRM without manual copy-paste.",
    summary:
      "EMC2Ops connects communication workflows to your CRM so teams can see what happened, what changed, and who owns the next step.",
    outcomes: [
      "Log summaries from calls, SMS, forms, and leasing conversations.",
      "Create tasks and update pipeline stages from workflow outcomes.",
      "Reduce duplicate records and stale CRM notes.",
    ],
    workflow: [
      "A leasing, tenant, owner, or vendor conversation reaches a defined outcome.",
      "The workflow converts that interaction into a clean summary and next step.",
      "CRM fields, tasks, tags, and notes update based on your rules.",
      "Staff can review exceptions without retyping the entire conversation.",
    ],
    metrics: ["CRM completeness", "manual updates avoided", "task creation accuracy", "duplicate records reduced"],
    faqs: [
      {
        question: "Which CRMs can EMC2Ops connect?",
        answer: "Most systems can be supported through native integrations, APIs, webhooks, Zapier, Make, n8n, or custom workflow logic.",
      },
      {
        question: "Can the workflow avoid noisy notes?",
        answer: "Yes. We define field rules so the CRM gets outcomes, summaries, and next steps instead of raw conversation clutter.",
      },
    ],
    relatedUseCases: [
      {
        label: "CRM follow-up cleanup",
        href: "/use-cases/real-estate-crm-follow-up-mess/",
        description: "Clean up stages, notes, tasks, duplicates, and follow-up ownership rules.",
      },
      {
        label: "Apartment lead tracking",
        href: "/use-cases/apartment-lead-tracking/",
        description: "Keep renter source, qualification, ownership, and CRM next steps visible.",
      },
      {
        label: "How to automate property management",
        href: "/use-cases/how-to-automate-property-management/",
        description: "Define the operating workflow before adding AI, Zapier, or CRM logic.",
      },
    ],
    relatedPosts: ["property-management-crm-workflow-automation", "property-management-lead-deduplication-routing"],
  },
  {
    slug: "owner-update-automation",
    eyebrow: "Owner communication",
    title: "Owner update automation for property managers",
    seoTitle: "Owner Update Automation",
    description:
      "Automate owner status updates for leasing, maintenance, renewals, and open issues without adding staff workload.",
    summary:
      "EMC2Ops helps property teams send proactive owner updates from real workflow data instead of rewriting the same status notes manually.",
    outcomes: [
      "Send structured owner updates before owners have to ask.",
      "Summarize leasing, maintenance, and renewal progress.",
      "Keep sensitive exceptions routed to staff for review.",
    ],
    workflow: [
      "A relevant status changes in leasing, maintenance, renewal, or operations.",
      "The workflow prepares an owner-friendly summary.",
      "Human review is kept for sensitive or high-stakes updates.",
      "Approved updates are sent and logged.",
    ],
    metrics: ["owner check-ins reduced", "status update coverage", "review time", "open issue visibility"],
    faqs: [
      {
        question: "Should every owner update be automated?",
        answer: "No. Use automation for repeatable status updates and keep human review for sensitive, financial, or relationship-heavy messages.",
      },
      {
        question: "Can updates be held for approval?",
        answer: "Yes. Approval steps are recommended when the message affects owner trust, cost, or policy.",
      },
    ],
    relatedUseCases: [
      {
        label: "How to automate property management",
        href: "/use-cases/how-to-automate-property-management/",
        description: "Start with a workflow that has clear events, owner visibility, and human review gates.",
      },
      {
        label: "CRM follow-up cleanup",
        href: "/use-cases/real-estate-crm-follow-up-mess/",
        description: "Use cleaner stages, notes, and tasks so owner updates come from reliable workflow data.",
      },
    ],
    relatedPosts: ["owner-updates-property-management-automation", "how-property-managers-get-new-owners"],
  },
  {
    slug: "vendor-dispatch-automation",
    eyebrow: "Vendor dispatch",
    title: "Vendor dispatch automation for property managers",
    seoTitle: "Vendor Dispatch Automation",
    description:
      "Route maintenance requests to vendors with issue context, urgency, property details, approvals, and CRM status updates.",
    summary:
      "EMC2Ops installs vendor dispatch workflows that reduce coordination loops while preserving approvals and escalation rules.",
    outcomes: [
      "Route categorized requests to the right vendor or staff path.",
      "Attach issue context, access notes, resident details, and urgency.",
      "Track dispatch status and update the CRM or work order record.",
    ],
    workflow: [
      "A maintenance request is categorized and ready for routing.",
      "The workflow checks trade, property, urgency, owner approval, and vendor rules.",
      "A clean dispatch summary is sent to the right path.",
      "Completion, delays, and exceptions are logged for staff visibility.",
    ],
    metrics: ["time to dispatch", "vendor response", "approval cycle time", "open work order visibility"],
    faqs: [
      {
        question: "Can dispatch rules vary by property?",
        answer: "Yes. Vendor lists, approval thresholds, and escalation rules can be configured by property, owner, trade, or urgency.",
      },
      {
        question: "Does automation approve repairs?",
        answer: "No. Expensive or policy-sensitive repairs should keep human approval before vendor action.",
      },
    ],
    relatedUseCases: [
      {
        label: "How to automate property management",
        href: "/use-cases/how-to-automate-property-management/",
        description: "Pick a narrow maintenance or vendor handoff before expanding automation.",
      },
      {
        label: "CRM follow-up cleanup",
        href: "/use-cases/real-estate-crm-follow-up-mess/",
        description: "Keep vendor dispatch ownership, exceptions, and status updates visible in the operating record.",
      },
    ],
    relatedPosts: ["automate-vendor-dispatch-property-management", "property-management-repair-approval-automation"],
  },
  {
    slug: "ai-front-desk-property-management",
    eyebrow: "AI front desk",
    title: "AI front desk for property management companies",
    seoTitle: "AI Front Desk for Property Managers",
    description:
      "Install AI voice, SMS, routing, and CRM workflows for leasing, tenant intake, maintenance, owners, and vendors.",
    summary:
      "EMC2Ops builds a practical AI front desk around the workflows your property team already runs every day.",
    outcomes: [
      "Respond faster across leasing, tenant, owner, and vendor workflows.",
      "Collect the right context before staff step in.",
      "Keep CRM records, tasks, and alerts current without manual retyping.",
    ],
    workflow: [
      "Map the current communication path and system of record.",
      "Pick the first high-volume workflow with measurable upside.",
      "Install AI voice, SMS, routing, and CRM logic around your rules.",
      "Monitor live conversations and improve prompts, routing, and reporting.",
    ],
    metrics: ["response speed", "workflow volume", "manual work removed", "booked next steps"],
    faqs: [
      {
        question: "Is this a chatbot subscription?",
        answer: "No. EMC2Ops installs operating workflows across voice, SMS, routing, CRM updates, and reporting.",
      },
      {
        question: "What should property managers automate first?",
        answer: "Most teams should start with missed-call recovery, leasing follow-up, maintenance intake, or CRM logging because those are easy to measure.",
      },
    ],
    relatedUseCases: [
      {
        label: "How to automate property management",
        href: "/use-cases/how-to-automate-property-management/",
        description: "Choose the first workflow for an AI front desk rollout without creating another mess.",
      },
      {
        label: "Real estate lead follow-up automation",
        href: "/use-cases/real-estate-lead-follow-up-automation/",
        description: "Connect AI front desk intake to practical leasing follow-up and CRM updates.",
      },
    ],
    relatedPosts: ["property-management-automation-tasks", "property-management-ai-automation-vs-chatbots"],
  },
];

export function serviceUrl(service: ServicePage) {
  return `/services/${service.slug}/`;
}

export function serviceSchema(service: ServicePage) {
  const url = absoluteUrl(serviceUrl(service));
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: service.title,
        description: service.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${url}#service` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "en-US",
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        serviceType: service.eyebrow,
        provider: { "@id": `${siteUrl}/#organization` },
        description: service.description,
        areaServed: "United States",
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Property management companies and multifamily operators",
        },
        serviceOutput: service.outcomes,
        potentialAction: {
          "@type": "ContactAction",
          target: `${siteUrl}/book-demo/`,
          name: "Request a workflow audit",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services/` },
          { "@type": "ListItem", position: 3, name: service.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}
