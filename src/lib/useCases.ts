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
    title: "Apartment lead tracking automation",
    seoTitle: "Apartment Lead Tracking for Multifamily Teams",
    description:
      "Capture apartment and multifamily lead tracking data from calls, forms, texts, ILS sources, and tours with CRM ownership, qualification, and follow-up.",
    h1: "Apartment lead tracking for calls, forms, texts, and tours",
    summary:
      "EMC2Ops installs apartment and multifamily lead tracking workflows that preserve source attribution, deduplicate repeat inquiries, qualify renter intent, assign ownership, and log the next step in the CRM.",
    painPoints: [
      "Apartment and multifamily leads arrive from calls, forms, ILS sources, texts, walk-ins, and tour requests with different levels of context.",
      "Duplicate renter records make it unclear which source won, who followed up, and what was promised.",
      "Leasing teams lose visibility when phone, SMS, and ILS touches are not logged back to the CRM.",
      "Managers cannot tell whether weak conversion comes from lead quality, response speed, or handoff discipline.",
    ],
    workflow: [
      "Capture source, property, unit interest, bedroom count, budget, move date, pets, and showing intent from each inbound channel.",
      "Match repeat inquiries by phone, email, property interest, and conversation history before creating another renter record.",
      "Route ownership to the correct property, leasing agent, backup queue, or review path with a due time.",
      "Trigger SMS, email, or call-task follow-up when a qualified renter stalls before booking, confirming, or applying.",
      "Write clean source, status, owner, summary, and next-step fields into the CRM so source-to-tour reporting stays current.",
    ],
    metrics: [
      "source-to-showing rate",
      "speed to first response",
      "duplicate leads merged",
      "unowned leads cleared",
      "CRM completion rate",
    ],
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
        question: "How do multifamily teams track leads from multiple sources?",
        answer:
          "Use one intake workflow that normalizes calls, forms, ILS alerts, texts, and tour requests before they create duplicate CRM records or separate follow-up paths.",
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
    seoTitle: "Property Management Automation Workflow Guide",
    description:
      "Choose the first property management automation to launch across leasing, maintenance, CRM logging, owner updates, and vendor handoffs.",
    h1: "How to automate property management without creating another mess",
    summary:
      "The safest first property management workflow automation is a narrow first-workflow selection with a clear trigger, required context, human exception path, and system-of-record update.",
    painPoints: [
      "Teams try to automate too many workflows before defining the operating rules.",
      "AI tools answer questions but do not update the CRM or route the next step.",
      "Approvals, emergencies, fair housing concerns, and financial decisions need human gates.",
      "Staff distrust automation when it creates duplicate work or noisy records.",
    ],
    workflow: [
      "Pick one measurable bottleneck: missed calls, leasing follow-up, maintenance intake, CRM logging, owner updates, or vendor dispatch.",
      "Define the trigger, required fields, owner, escalation rules, stop conditions, and final record that should exist.",
      "Connect the communication channel to the CRM, inbox, calendar, task system, work order process, or owner update path.",
      "Launch with conservative human review for emergencies, fair-housing-sensitive questions, approvals, and unclear routing.",
      "Review early conversations weekly and improve prompts, timing, CRM writebacks, reporting, and exception handling.",
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
        question: "What makes property management workflow automation different from a chatbot?",
        answer:
          "Workflow automation starts from an operating trigger, collects required context, routes the next step, escalates exceptions, and updates the system of record instead of only answering questions.",
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
      "lead to lease workflow",
      "workflow for lease management",
      "leasing pipeline automation",
      "leasing conversion automation",
    ],
    intent: "A leasing team wants the full inquiry-to-lease path to move faster and with fewer dropped steps.",
    title: "Lead-to-lease automation",
    seoTitle: "Lead-to-Lease Automation Workflow",
    description:
      "Automate inquiry-to-lease handoffs from renter lead capture through tours, applications, approval routing, move-in tasks, and CRM reporting.",
    h1: "Lead-to-lease automation that keeps every renter next step visible",
    summary:
      "EMC2Ops helps property managers turn the lead to lease workflow into one tracked path across first inquiry, qualification, tour scheduling, application follow-up, approval routing, and move-in handoff.",
    painPoints: [
      "The renter journey breaks when the workflow for lease management is spread across inquiry, tour, application, approval, and move-in handoffs.",
      "No-shows and partial applications do not trigger timely recovery steps.",
      "CRM stages lag behind what actually happened in calls, texts, and inboxes.",
      "Managers cannot see which step is leaking qualified renters.",
    ],
    workflow: [
      "Capture and qualify the inquiry with source, property, unit fit, budget, move date, pets, and preferred tour path.",
      "Route booking, reminders, confirmations, no-show recovery, and rescheduling into the leasing calendar and CRM.",
      "Follow up on missing application items, stalled approvals, and incomplete renter steps by stage.",
      "Route pricing questions, accommodation requests, exceptions, and approval decisions to staff with context.",
      "Create move-in readiness tasks, owner-visible status, and CRM reporting updates once the renter is approved.",
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
        question: "What lead-to-lease stages can be automated first?",
        answer:
          "Start with inquiry capture, tour booking, reminders, no-show recovery, application follow-up, and CRM status updates because those stages have clear triggers and measurable outcomes.",
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
    primaryKeyword: "real estate CRM cleanup",
    clusterKeywords: [
      "property management CRM cleanup",
      "real estate CRM follow-up cleanup",
      "messy real estate CRM",
      "broken pipeline stages",
      "CRM duplicate cleanup",
    ],
    intent: "A buyer is blaming the CRM, but the deeper issue is usually follow-up process and data hygiene.",
    title: "Real estate CRM follow-up cleanup",
    seoTitle: "Real Estate CRM Cleanup for Follow-Up",
    description:
      "Clean up real estate CRM stages, duplicates, ownership, notes, tasks, and follow-up rules so property teams can trust the next action.",
    h1: "Real estate CRM cleanup for broken follow-up",
    summary:
      "If follow-up is a mess, EMC2Ops provides a real estate CRM cleanup service focused on the workflow around the CRM: what enters, who owns it, what gets logged, how to fix messy pipeline stages, when tasks fire, and when a human takes over.",
    painPoints: [
      "Teams search for a new CRM when the real issue is inconsistent follow-up behavior.",
      "Duplicate leads, missing notes, stale stages, and unclear ownership make every CRM feel broken.",
      "Managers need to fix a messy real estate CRM database before automation can create reliable follow-up.",
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
      {
        question: "Can EMC2Ops fix messy real estate CRM pipeline stages?",
        answer:
          "Yes. The cleanup starts by defining the stages, required fields, duplicate rules, task triggers, and ownership handoffs that make the CRM reflect real follow-up instead of stale activity.",
      },
    ],
  },
  {
    slug: "security-deposit-automation",
    primaryKeyword: "security deposit automation",
    clusterKeywords: [
      "security deposit disposition automation",
      "security deposit return automation",
      "property management deposit workflow",
      "move-out deposit automation",
      "security deposit deduction review",
      "deposit accounting workflow",
    ],
    intent:
      "A property management team wants every move-out deposit case to have complete evidence, reconciled amounts, clear approval ownership, deadline visibility, and a defensible disposition trail.",
    title: "Security deposit automation",
    seoTitle: "Security Deposit Automation for Property Managers",
    description:
      "Automate security deposit move-out intake, evidence review, proposed deductions, manager approvals, disposition documents, delivery, and refund tracking.",
    h1: "Security deposit automation that keeps every deduction tied to evidence",
    summary:
      "EMC2Ops installs a security deposit workflow that assembles move-out records, compares verified evidence, reconciles proposed deductions and refunds, routes exceptions for manager approval, and preserves a complete disposition trail. AI can organize and summarize evidence; authorized staff make every final financial and legal decision.",
    painPoints: [
      "Move-out records are scattered across the PMS, inspection tools, inboxes, photos, vendor bills, resident messages, and spreadsheets.",
      "Staff reconstruct the deposit held, credits, proposed deductions, refund, and deadline by hand for every case.",
      "Photos and inspection findings are not reliably tied to the exact observation, charge, decision, and reviewer they support.",
      "A missing forwarding address, invoice, required image, amount reconciliation, or approval is often discovered only when the deadline is close.",
      "AI and automation cannot safely decide liability, normal wear, legal compliance, deductions, or money without authorized human review.",
    ],
    workflow: [
      "Import or select the verified move-out and lock the property, unit, resident, ledger, jurisdiction or policy, and case version.",
      "Assemble the deposit ledger, move-in and move-out inspections, verified photos, invoices, lease or policy documents, and relevant correspondence.",
      "Apply the approved rule version and deadline source, then calculate the internal review target while leaving legal interpretation with authorized staff and counsel.",
      "Draft neutral, source-linked observations and reconcile the proposed deductions, credits, and refund without treating AI suggestions as decisions.",
      "Route missing evidence, mismatches, exceptions, and the exact frozen proposal to an authorized manager for review and approval.",
      "Generate the approved disposition artifact and track delivery, refund fulfillment, and PMS writeback without moving money automatically.",
    ],
    metrics: [
      "deposit cases processed per month",
      "evidence completeness",
      "days to manager-ready",
      "exception rate",
      "approval rework",
      "deadline adherence",
      "manual touches per case",
    ],
    bestFit: [
      "Property operators processing enough move-outs that manual deposit files create recurring coordination and deadline pressure.",
      "Teams whose ledger, inspections, images, invoices, approvals, delivery, and refund status currently live across several systems.",
      "Organizations ready to define counsel-approved rules, evidence requirements, access boundaries, staff roles, and approval gates.",
    ],
    relatedServices: [
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
      { label: "Owner update automation", href: "/services/owner-update-automation/" },
      { label: "Maintenance intake automation", href: "/services/maintenance-intake-automation/" },
    ],
    relatedGuides: [
      {
        label: "Property Management Security Deposit Return Automation",
        href: "/blog/property-management-security-deposit-return-automation/",
      },
      {
        label: "Property Management Move-Out Automation",
        href: "/blog/property-management-move-out-automation/",
      },
    ],
    faqs: [
      {
        question: "What can security deposit automation handle?",
        answer:
          "It can open a case from a verified move-out, assemble ledger and evidence records, compare verified images, draft source-linked observations, reconcile a proposed disposition, route exceptions and approvals, generate the approved artifact, and track delivery, refund, and writeback milestones.",
      },
      {
        question: "Does AI decide security deposit deductions or refunds?",
        answer:
          "No. AI may organize evidence and draft neutral, source-linked observations. Authorized staff remain responsible for policy, liability, wear, legal, deduction, refund, and approval decisions.",
      },
      {
        question: "Can this connect to AppFolio or our existing property management system?",
        answer:
          "Yes, after the account's permissions and supported access path are verified. The workflow can use supported APIs, exports, inbox parsing, middleware, secure review queues, or manual writeback without promising unavailable direct access.",
      },
      {
        question: "Does EMC2Ops guarantee security deposit legal compliance?",
        answer:
          "No. The workflow uses the operator's counsel-approved policies, rule configuration, deadline sources, and human review gates. It provides operational controls and an audit trail, not legal advice or a substitute for counsel.",
      },
      {
        question: "Does the product send refunds automatically?",
        answer:
          "Not by default. It tracks the approved refund and fulfillment status. Moving money requires a separately approved payment integration, permissions, controls, reconciliation, and human authorization.",
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
