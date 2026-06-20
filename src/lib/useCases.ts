import { absoluteUrl, organizationSchema, siteUrl, websiteSchema } from "./site";

export interface UseCasePage {
  slug: string;
  primaryKeyword: string;
  clusterKeywords: string[];
  intent: string;
  title: string;
  seoTitle: string;
  description: string;
  h1: string;
  summary: string;
  painPoints: string[];
  workflow: string[];
  metrics: string[];
  bestFit: string[];
  relatedServices: Array<{ label: string; href: string }>;
  relatedGuides: Array<{ label: string; href: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const useCasePages: UseCasePage[] = [
  {
    slug: "apartment-lead-tracking",
    primaryKeyword: "apartment lead tracking",
    clusterKeywords: [
      "apartment lead management",
      "apartment lead tracking software",
      "multifamily lead tracking",
      "apartment leasing lead follow up",
      "rental lead tracking",
    ],
    intent: "A leasing operator wants to stop losing renter leads between first inquiry and tour.",
    title: "Apartment lead tracking",
    seoTitle: "Apartment Lead Tracking for Property Managers",
    description:
      "Track apartment leads from first call, form, text, or tour request through qualification, follow-up, CRM logging, and booked showing.",
    h1: "Apartment lead tracking that keeps renter inquiries from disappearing",
    summary:
      "EMC2Ops installs lead tracking workflows that capture where a renter came from, what they asked for, who owns the next step, and what should happen next in the CRM.",
    painPoints: [
      "Leads arrive from calls, forms, ILS sources, texts, and walk-ins with different levels of context.",
      "Duplicate renter records make it unclear who followed up and what was promised.",
      "Leasing teams lose visibility when calls or texts are not logged back to the CRM.",
      "Managers cannot tell whether the issue is lead quality, response speed, or handoff discipline.",
    ],
    workflow: [
      "Capture the source, property, unit interest, budget, move date, pets, and showing intent.",
      "Deduplicate repeat inquiries and route ownership to the right property or leasing agent.",
      "Trigger SMS or email follow-up when a renter stalls before booking or confirming a tour.",
      "Write clean notes, tags, tasks, and next steps into the CRM so reporting stays current.",
    ],
    metrics: ["source-to-showing rate", "speed to first response", "duplicate leads merged", "CRM completion rate"],
    bestFit: [
      "Multifamily teams with multiple lead sources.",
      "Property managers whose leasing CRM is often incomplete.",
      "Operators trying to understand why paid leads do not become tours.",
    ],
    relatedServices: [
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
    ],
    relatedGuides: [
      { label: "Apartment Lead Tracking: How to Stop Losing Renters", href: "/blog/apartment-lead-tracking/" },
      { label: "Property Management Lead Deduplication and Routing", href: "/blog/property-management-lead-deduplication-routing/" },
    ],
    faqs: [
      {
        question: "What is apartment lead tracking?",
        answer:
          "Apartment lead tracking is the process of capturing each renter inquiry, source, qualification detail, owner, follow-up step, and outcome from first contact through tour or application.",
      },
      {
        question: "Can EMC2Ops connect lead tracking to my existing CRM?",
        answer:
          "Yes. The workflow can route summaries, tags, tasks, and status updates through supported APIs, webhooks, Zapier, Make, n8n, or other middleware paths.",
      },
    ],
  },
  {
    slug: "real-estate-lead-follow-up-automation",
    primaryKeyword: "real estate lead follow up automation",
    clusterKeywords: [
      "automated real estate lead follow up",
      "rental lead follow up automation",
      "property management lead follow up",
      "leasing follow up automation",
      "real estate text follow up",
    ],
    intent: "A team wants automated follow-up that protects speed-to-lead without sounding careless.",
    title: "Real estate lead follow-up automation",
    seoTitle: "Real Estate Lead Follow-Up Automation for Property Managers",
    description:
      "Automate real estate and rental lead follow-up across SMS, email, reminders, CRM tasks, and human handoff rules.",
    h1: "Real estate lead follow-up automation for rental and property management teams",
    summary:
      "EMC2Ops builds follow-up workflows that respond quickly, ask the right qualifying questions, stop when a human takes over, and keep every lead stage visible.",
    painPoints: [
      "Warm renters go cold because the first response or second touch takes too long.",
      "Teams send generic follow-up that ignores move date, property fit, budget, or tour status.",
      "No-shows, stale replies, and incomplete applications sit in the CRM without a next action.",
      "Automation keeps messaging after a staff member already responded.",
    ],
    workflow: [
      "Segment leads by source, property, status, urgency, and last known renter action.",
      "Send short follow-ups that move the renter toward booking, confirming, rescheduling, or completing an application.",
      "Use stop rules when a human replies, a renter opts out, or the lead reaches a sensitive path.",
      "Update CRM notes, tasks, stages, and ownership after each meaningful reply or timeout.",
    ],
    metrics: ["reply rate", "lead-to-tour rate", "no-show recovery", "stale leads reactivated"],
    bestFit: [
      "Teams with high inquiry volume after hours or during tours.",
      "Operators with stale leads sitting in CRM stages.",
      "Leasing teams that need consistent follow-up without losing human control.",
    ],
    relatedServices: [
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
    ],
    relatedGuides: [
      { label: "Automate Property Management Lead Follow-Up", href: "/blog/automate-property-management-lead-follow-up/" },
      { label: "AI Leasing Follow-Up for Property Management", href: "/blog/ai-leasing-follow-up-property-management/" },
    ],
    faqs: [
      {
        question: "What should real estate lead follow-up automation send first?",
        answer:
          "The first message should acknowledge the inquiry, confirm the property or unit interest, and ask for the next piece of context needed to book, qualify, or route the lead.",
      },
      {
        question: "How do you keep automated follow-up from annoying leads?",
        answer:
          "Use short sequences, clear stop rules, opt-out handling, stage-based timing, and escalation to staff when the lead asks a specific or sensitive question.",
      },
    ],
  },
  {
    slug: "how-to-automate-property-management",
    primaryKeyword: "how to automate property management",
    clusterKeywords: [
      "property management automation",
      "property management workflow automation",
      "automate property management tasks",
      "AI automation for property managers",
      "property management automation examples",
    ],
    intent: "An operator wants a practical starting point for automation without rebuilding the whole business.",
    title: "How to automate property management",
    seoTitle: "How to Automate Property Management Workflows",
    description:
      "Learn how to automate property management workflows by starting with leasing, maintenance, CRM logging, owner updates, and vendor handoffs.",
    h1: "How to automate property management without creating another mess",
    summary:
      "The best first automation is usually a narrow workflow with a clear trigger, required context, human exception path, and system-of-record update.",
    painPoints: [
      "Teams try to automate too many workflows before defining the operating rules.",
      "AI tools answer questions but do not update the CRM or route the next step.",
      "Approvals, emergencies, fair housing concerns, and financial decisions need human gates.",
      "Staff distrust automation when it creates duplicate work or noisy records.",
    ],
    workflow: [
      "Pick one measurable bottleneck: missed calls, leasing follow-up, maintenance intake, CRM logging, owner updates, or vendor dispatch.",
      "Define the trigger, required fields, escalation rules, and final record that should exist.",
      "Connect the communication channel to the CRM, inbox, calendar, task system, or work order process.",
      "Review early conversations weekly and improve prompts, routing, timing, and reporting.",
    ],
    metrics: ["manual tasks removed", "response speed", "completed handoffs", "exception rate"],
    bestFit: [
      "Property managers starting with their first AI workflow.",
      "Teams that need practical ROI instead of a chatbot demo.",
      "Operators who want automation with human approval gates.",
    ],
    relatedServices: [
      { label: "AI front desk for property management", href: "/services/ai-front-desk-property-management/" },
      { label: "Maintenance intake automation", href: "/services/maintenance-intake-automation/" },
      { label: "Owner update automation", href: "/services/owner-update-automation/" },
    ],
    relatedGuides: [
      { label: "Property Management Automation: 15 Tasks to Automate", href: "/blog/property-management-automation-tasks/" },
      { label: "Property Management AI Implementation Timeline", href: "/blog/property-management-ai-implementation-timeline/" },
    ],
    faqs: [
      {
        question: "What property management task should I automate first?",
        answer:
          "Start with a high-volume, measurable workflow such as missed-call recovery, leasing follow-up, maintenance intake, CRM logging, owner updates, or vendor dispatch.",
      },
      {
        question: "Can property management automation work with my current tools?",
        answer:
          "Usually, yes. Most workflows can be connected through existing CRMs, phone systems, SMS tools, inboxes, APIs, webhooks, Zapier, Make, n8n, or custom middleware.",
      },
    ],
  },
  {
    slug: "lead-to-lease-automation",
    primaryKeyword: "lead-to-lease automation",
    clusterKeywords: [
      "lead to lease automation",
      "lead-to-lease workflow",
      "leasing pipeline automation",
      "renter journey automation",
      "leasing conversion automation",
    ],
    intent: "A leasing team wants the full inquiry-to-lease path to move faster and with fewer dropped steps.",
    title: "Lead-to-lease automation",
    seoTitle: "Lead-to-Lease Automation for Property Management",
    description:
      "Build lead-to-lease automation that tracks renters from inquiry to tour, application, approval, move-in, and CRM reporting.",
    h1: "Lead-to-lease automation that keeps every renter next step visible",
    summary:
      "EMC2Ops helps property managers connect first inquiry, qualification, showing, application follow-up, approval routing, and move-in handoff into one tracked workflow.",
    painPoints: [
      "The renter journey breaks between inquiry, tour, application, approval, and move-in.",
      "No-shows and partial applications do not trigger timely recovery steps.",
      "CRM stages lag behind what actually happened in calls, texts, and inboxes.",
      "Managers cannot see which step is leaking qualified renters.",
    ],
    workflow: [
      "Capture and qualify the inquiry with the minimum details needed for the next step.",
      "Route booking, reminders, confirmations, no-show recovery, and rescheduling into the leasing calendar and CRM.",
      "Follow up on missing application items and route exceptions to staff.",
      "Create move-in readiness tasks and status updates once the renter is approved.",
    ],
    metrics: ["lead-to-tour rate", "tour-to-application rate", "application completion", "lead-to-lease conversion"],
    bestFit: [
      "Leasing teams with many handoffs between systems.",
      "Operators trying to improve conversion before buying more leads.",
      "Property managers that need cleaner reporting across the renter journey.",
    ],
    relatedServices: [
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
    ],
    relatedGuides: [
      { label: "Property Management Leasing Pipeline Setup", href: "/blog/property-management-leasing-pipeline-setup/" },
      { label: "Property Management Application Follow-Up Automation", href: "/blog/property-management-application-follow-up-automation/" },
    ],
    faqs: [
      {
        question: "What is lead-to-lease automation?",
        answer:
          "Lead-to-lease automation connects the renter journey from first inquiry through qualification, tour scheduling, application follow-up, approval routing, and move-in handoff.",
      },
      {
        question: "Does lead-to-lease automation replace leasing staff?",
        answer:
          "No. It handles repetitive reminders, routing, CRM logging, and status updates so leasing staff can focus on the conversations that need judgment.",
      },
    ],
  },
  {
    slug: "real-estate-crm-follow-up-mess",
    primaryKeyword: "best real estate CRM when follow up is a mess",
    clusterKeywords: [
      "real estate CRM follow up",
      "property management CRM follow up",
      "CRM follow up automation",
      "messy CRM lead follow up",
      "real estate CRM automation",
    ],
    intent: "A buyer is blaming the CRM, but the deeper issue is usually follow-up process and data hygiene.",
    title: "Real estate CRM follow-up cleanup",
    seoTitle: "Best Real Estate CRM When Follow-Up Is a Mess",
    description:
      "Before switching CRMs, fix the follow-up workflow: ownership, stages, notes, tasks, duplicate leads, and automated next steps.",
    h1: "The best real estate CRM will not fix messy follow-up by itself",
    summary:
      "If follow-up is a mess, EMC2Ops starts by cleaning the workflow around the CRM: what enters, who owns it, what gets logged, when tasks fire, and when a human takes over.",
    painPoints: [
      "Teams search for a new CRM when the real issue is inconsistent follow-up behavior.",
      "Duplicate leads, missing notes, stale stages, and unclear ownership make every CRM feel broken.",
      "Automation adds more noise when it logs raw conversations instead of clean outcomes.",
      "Managers cannot trust reports because fields do not reflect the current lead status.",
    ],
    workflow: [
      "Audit how leads enter the CRM from calls, forms, texts, ads, ILS sources, and referrals.",
      "Define ownership, required fields, duplicate rules, stages, and task timing.",
      "Create automation that logs concise outcomes, next steps, tags, and follow-up tasks.",
      "Review exception queues instead of asking staff to manually reconcile every conversation.",
    ],
    metrics: ["stale stage reduction", "tasks created accurately", "duplicate records reduced", "manual CRM updates avoided"],
    bestFit: [
      "Teams considering a CRM switch because follow-up feels chaotic.",
      "Property managers with lead ownership and duplicate record problems.",
      "Operators who need cleaner reporting from the CRM they already have.",
    ],
    relatedServices: [
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
    ],
    relatedGuides: [
      { label: "Property Management CRM Workflow Automation", href: "/blog/property-management-crm-workflow-automation/" },
      { label: "Property Management Lead Deduplication and Routing", href: "/blog/property-management-lead-deduplication-routing/" },
    ],
    faqs: [
      {
        question: "Should I switch CRMs if follow-up is a mess?",
        answer:
          "Not immediately. First audit the lead sources, ownership rules, stages, required fields, tasks, duplicate handling, and follow-up timing. A new CRM will not fix unclear workflow rules.",
      },
      {
        question: "How can automation clean up CRM follow-up?",
        answer:
          "Automation can create tasks, update stages, merge or flag duplicates, log concise summaries, and route exceptions so staff work from current context instead of stale records.",
      },
    ],
  },
];

export function useCaseUrl(useCase: UseCasePage) {
  return `/use-cases/${useCase.slug}/`;
}

export function useCasesIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/use-cases/#webpage`,
        url: `${siteUrl}/use-cases/`,
        name: "Property Management Automation Use Cases",
        description:
          "Use-case cluster for apartment lead tracking, real estate lead follow-up automation, lead-to-lease automation, CRM follow-up cleanup, and property management workflow automation.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "en-US",
        about: [
          "apartment lead tracking",
          "real estate lead follow up automation",
          "lead-to-lease automation",
          "property management automation",
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/use-cases/#item-list`,
        name: "EMC2Ops use-case pages",
        itemListElement: useCasePages.map((useCase, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(useCaseUrl(useCase)),
          name: useCase.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/use-cases/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Use Cases", item: `${siteUrl}/use-cases/` },
        ],
      },
    ],
  };
}

export function useCaseSchema(useCase: UseCasePage) {
  const url = absoluteUrl(useCaseUrl(useCase));
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: useCase.title,
        description: useCase.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: [useCase.primaryKeyword, ...useCase.clusterKeywords],
        keywords: [useCase.primaryKeyword, ...useCase.clusterKeywords],
        inLanguage: "en-US",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: useCase.title,
        provider: { "@id": `${siteUrl}/#organization` },
        serviceType: "Property management automation use case",
        description: useCase.summary,
        areaServed: "United States",
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Property management companies, multifamily operators, and leasing teams",
        },
        serviceOutput: useCase.metrics,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Use Cases", item: `${siteUrl}/use-cases/` },
          { "@type": "ListItem", position: 3, name: useCase.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: useCase.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}
