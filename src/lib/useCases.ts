import { absoluteUrl, founderSchema, organizationSchema, siteUrl, websiteSchema } from "./site";
import {
  auditHref,
  type AuditCta,
  type BeforeAfter,
  type InstallableItem,
  type WorkflowExample,
  type WorkflowTemplate,
} from "./conversion";

export interface UseCasePage {
  slug: string;
  primaryKeyword: string;
  clusterKeywords: string[];
  intent: string;
  title: string;
  seoTitle: string;
  description: string;
  updatedAt?: string;
  h1: string;
  summary: string;
  outcomes?: string[];
  auditFocus: string;
  auditCta: AuditCta;
  painPoints: string[];
  workflow: string[];
  example: WorkflowExample;
  template: WorkflowTemplate;
  installables: InstallableItem[];
  beforeAfter: BeforeAfter;
  metrics: string[];
  bestFit: string[];
  notFit: string[];
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
      "See every renter inquiry from source to booked tour—even when it arrives through calls, forms, ILS, or text. EMC2Ops installs the tracking, deduplication, follow-up, routing, and CRM updates for you.",
    auditFocus:
      "We review each renter lead source, duplicate rules, qualification fields, ownership handoffs, follow-up triggers, and CRM writeback path.",
    auditCta: {
      label: "Book my apartment lead tracking audit",
      title: "Want multifamily lead tracking your team can trust?",
      body: "We will trace one lead from source to tour and identify where ownership, qualification, or CRM updates are breaking.",
    },
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
    example: {
      title: "Example: missed apartment inquiry to booked tour",
      steps: [
        "A renter submits an ILS form and calls the property 12 minutes later.",
        "The workflow recognizes the duplicate lead, keeps the original source, and appends the call context.",
        "AI asks for move date, unit size, budget, pets, and preferred tour window.",
        "The CRM receives one clean lead record with owner, source, qualification fields, and next task.",
      ],
    },
    template: {
      title: "Apartment lead tracking field template",
      rows: [
        ["Lead source", "Capture ILS, call, form, referral, walk-in, or text source.", "CRM or lead source"],
        ["Renter fit", "Store move date, unit interest, budget, pets, and preferred tour time.", "AI intake"],
        ["Ownership", "Assign property, leasing agent, backup owner, and follow-up due time.", "Routing rule"],
        ["Outcome", "Log booked tour, stale lead, duplicate, disqualified, or application started.", "CRM update"],
      ],
    },
    installables: [
      {
        title: "Lead-source triggers",
        description: "Calls, ILS forms, website forms, SMS, referrals, walk-ins, and tour requests normalized into one intake path.",
      },
      {
        title: "Renter context",
        description: "Source, property, move date, unit interest, budget, pets, tour intent, and duplicate identity signals.",
      },
      {
        title: "Routing automations",
        description: "Owner assignment, backup queue rules, follow-up tasks, stale-lead reminders, and tour booking prompts.",
      },
      {
        title: "CRM writebacks",
        description: "Clean lead source, qualification fields, owner, status, summary, and next step logged for reporting.",
      },
      {
        title: "Stop rules",
        description: "Guards for duplicate records, staff takeover, booked tours, opt-outs, and disqualified renters.",
      },
      {
        title: "Escalation paths",
        description: "Human review for source conflicts, unclear identity, high-intent replies, or fair-housing-sensitive questions.",
      },
    ],
    beforeAfter: {
      before: [
        "Leads arrive from several channels with inconsistent context.",
        "Duplicate renter records blur source attribution and ownership.",
        "Managers cannot see where qualified renters drop before tours.",
      ],
      after: [
        "Every renter inquiry is normalized into a trackable lead path.",
        "Duplicates are merged or flagged before ownership gets confused.",
        "Source, qualification, owner, and next action are visible in the CRM.",
      ],
    },
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
    notFit: [
      "You only receive a few renter leads per month and can track them manually.",
      "Your CRM cannot accept any source, status, task, or note updates.",
      "You are not ready to define ownership and duplicate rules.",
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
    auditFocus:
      "We map your lead sources, follow-up windows, message goals, CRM stages, stop rules, and human handoff paths.",
    auditCta: {
      label: "Book my lead follow-up audit",
      title: "Want lead follow-up that moves renters to the next step?",
      body: "We will inspect where leads stall and define the first sequence that can safely improve response, booking, or application completion.",
    },
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
    example: {
      title: "Example: stale renter lead recovery",
      steps: [
        "A qualified renter asks about availability but does not book a tour.",
        "The workflow waits until the next defined follow-up window and sends a short SMS with one clear next step.",
        "If the renter replies, staff get context and the automation stops.",
        "If the renter does not reply, the CRM receives a stale-lead task and final sequence status.",
      ],
    },
    template: {
      title: "Follow-up sequence template",
      rows: [
        ["Trigger", "New inquiry, missed call, no-show, stale reply, or incomplete application.", "CRM status"],
        ["Message goal", "Book, confirm, reschedule, complete application, or close the loop.", "Sequence rule"],
        ["Stop rule", "Stop when staff reply, renter opts out, appointment is booked, or question needs review.", "Automation guardrail"],
        ["CRM writeback", "Log reply, stage, next owner, task due date, and sequence outcome.", "CRM update"],
      ],
    },
    installables: [
      {
        title: "Follow-up triggers",
        description: "New inquiries, missed calls, stale replies, no-shows, incomplete applications, and stalled approvals.",
      },
      {
        title: "Lead context",
        description: "Source, property, last action, move date, unit fit, consent, current stage, and staff owner.",
      },
      {
        title: "Stage-aware messages",
        description: "SMS, email, and task prompts that ask for the next action instead of sending generic nurture copy.",
      },
      {
        title: "CRM writebacks",
        description: "Reply status, stage, next owner, task due date, booked event, and sequence outcome.",
      },
      {
        title: "Stop rules",
        description: "Automation stops when staff reply, a renter opts out, a tour is booked, or a question needs review.",
      },
      {
        title: "Escalation paths",
        description: "Staff handoff for pricing, accommodations, unusual renter questions, complaints, or high-intent replies.",
      },
    ],
    beforeAfter: {
      before: [
        "Warm leads wait for a manual second touch.",
        "Follow-up ignores the renter's stage and last action.",
        "Managers cannot tell which stalled leads still need staff attention.",
      ],
      after: [
        "Each stalled lead receives a clear next-step prompt at the right moment.",
        "Automation pauses as soon as a human or renter action changes the path.",
        "The CRM shows sequence outcome, owner, and follow-up status.",
      ],
    },
    metrics: ["reply rate", "lead-to-tour rate", "no-show recovery", "stale leads reactivated"],
    bestFit: [
      "Teams with high inquiry volume after hours or during tours.",
      "Operators with stale leads sitting in CRM stages.",
      "Leasing teams that need consistent follow-up without losing human control.",
    ],
    notFit: [
      "You want broad email marketing instead of operational lead follow-up.",
      "Your team cannot define when a lead should stop receiving messages.",
      "You do not have consent and opt-out handling ready for SMS workflows.",
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
    auditFocus:
      "We score candidate workflows by volume, risk, measurability, system access, exception handling, and the quality of the final record.",
    auditCta: {
      label: "Book my first workflow audit",
      title: "Want to choose the right first property management workflow?",
      body: "We will compare your leasing, maintenance, CRM, owner, and vendor bottlenecks and pick the first automation with a clean trigger and measurable outcome.",
    },
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
    example: {
      title: "Example: first workflow selection",
      steps: [
        "The team lists the five highest-volume handoffs: missed calls, maintenance intake, owner updates, vendor dispatch, and CRM notes.",
        "Each workflow is scored by volume, risk, measurability, and staff frustration.",
        "The first launch is limited to one trigger and one system-of-record update.",
        "After one week of live review, prompts, routing, and reporting are adjusted before expanding.",
      ],
    },
    template: {
      title: "Property management automation planning template",
      rows: [
        ["Trigger", "What event should start the workflow?", "Operations lead"],
        ["Required context", "What fields must be collected before the team can act?", "Workflow owner"],
        ["Exception path", "What should stop automation and alert a human?", "Manager"],
        ["Final record", "What CRM, work order, task, or owner update should exist at the end?", "System owner"],
      ],
    },
    installables: [
      {
        title: "Workflow scoring",
        description: "A practical shortlist based on volume, risk, measurability, staff frustration, and system access.",
      },
      {
        title: "Trigger definition",
        description: "The event, fields, owner, timing, and final record needed to make the first workflow operational.",
      },
      {
        title: "Automation path",
        description: "Prompts, routing, CRM updates, approval queues, and review steps for the selected first workflow.",
      },
      {
        title: "System writebacks",
        description: "The CRM note, task, work order, owner update, or status field that proves the workflow completed.",
      },
      {
        title: "Stop rules",
        description: "Controls for emergencies, approvals, sensitive questions, staff takeover, and unclear answers.",
      },
      {
        title: "Launch review",
        description: "A first-week review loop for prompt tuning, exception cleanup, reporting, and expansion decisions.",
      },
    ],
    beforeAfter: {
      before: [
        "Automation ideas compete without a clear first workflow.",
        "Tools answer questions but do not update operating records.",
        "Staff worry automation will create more exception handling.",
      ],
      after: [
        "The first workflow has a trigger, owner, final record, and review path.",
        "Automation improves one measurable bottleneck before expansion.",
        "Staff see where humans stay in control and where automation can run.",
      ],
    },
    metrics: ["manual tasks removed", "response speed", "completed handoffs", "exception rate"],
    bestFit: [
      "Property managers starting with their first AI workflow.",
      "Teams that need practical ROI instead of a chatbot demo.",
      "Operators who want automation with human approval gates.",
    ],
    notFit: [
      "You want to automate every department before choosing a first workflow.",
      "There is no current system of record for the workflow outcome.",
      "Your team is not ready to define exceptions, approvals, and human review.",
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
    auditFocus:
      "We review the full lead to lease workflow across inquiry, qualification, tour, application, approval, move-in readiness, CRM stages, and handoffs.",
    auditCta: {
      label: "Book my lead-to-lease audit",
      title: "Want the lead-to-lease workflow to show every next step?",
      body: "We will trace a renter from first inquiry to move-in and find the stage where automation should protect conversion first.",
    },
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
    example: {
      title: "Example: inquiry to move-in handoff",
      steps: [
        "A renter asks about a unit after hours and receives an immediate qualification path.",
        "The workflow books a tour, sends reminders, and recovers the lead if they no-show.",
        "After application start, missing-document follow-up and staff exceptions are routed by status.",
        "Once approved, move-in readiness tasks and CRM notes are created for the leasing team.",
      ],
    },
    template: {
      title: "Lead-to-lease stage template",
      rows: [
        ["Inquiry", "Source, property, unit fit, budget, move date, and channel.", "AI intake"],
        ["Tour", "Booked time, confirmation, reminder, no-show, and reschedule status.", "Calendar/CRM"],
        ["Application", "Started, missing items, submitted, exception, or approved.", "Application workflow"],
        ["Move-in", "Deposit, utilities, lease status, keys, welcome message, and readiness tasks.", "Move-in workflow"],
      ],
    },
    installables: [
      {
        title: "Journey triggers",
        description: "Inquiry, qualification, booking, no-show, application start, missing items, approval, and move-in readiness.",
      },
      {
        title: "Renter context",
        description: "Source, property, unit fit, budget, move date, tour status, application status, and required next action.",
      },
      {
        title: "Stage automations",
        description: "Booking prompts, reminders, no-show recovery, application follow-up, approval routing, and move-in tasks.",
      },
      {
        title: "CRM writebacks",
        description: "Lead stage, tour status, application progress, owner, next task, and move-in readiness logged in one path.",
      },
      {
        title: "Stop rules",
        description: "Controls for staff takeover, opt-outs, disqualification, completed applications, and sensitive questions.",
      },
      {
        title: "Escalation paths",
        description: "Human review for pricing, accommodation requests, approvals, exceptions, and lease-management questions.",
      },
    ],
    beforeAfter: {
      before: [
        "Inquiry, tour, application, approval, and move-in live in separate handoffs.",
        "No-shows and incomplete applications wait for manual recovery.",
        "Managers cannot see which stage is leaking qualified renters.",
      ],
      after: [
        "The workflow for lease management has visible stages and owners.",
        "Every stalled renter has a next action, stop rule, or staff handoff.",
        "CRM reporting reflects the lead-to-lease path from inquiry to move-in.",
      ],
    },
    metrics: ["lead-to-tour rate", "tour-to-application rate", "application completion", "lead-to-lease conversion"],
    bestFit: [
      "Leasing teams with many handoffs between systems.",
      "Operators trying to improve conversion before buying more leads.",
      "Property managers that need cleaner reporting across the renter journey.",
    ],
    notFit: [
      "You only need a single reminder message rather than a full stage workflow.",
      "Application and approval rules are not defined enough to automate safely.",
      "Your team is not ready to connect leasing activity back to the CRM.",
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
    auditFocus:
      "We inspect lead intake, duplicate records, pipeline stages, required fields, task rules, stale follow-up, notes, and reporting gaps before recommending CRM changes.",
    auditCta: {
      label: "Book my CRM cleanup audit",
      title: "Want to fix the workflow before switching CRMs?",
      body: "We will review where records get messy, which stages need cleanup, and which automations can make follow-up trustworthy again.",
    },
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
    example: {
      title: "Example: fixing a messy CRM without switching tools",
      steps: [
        "The team exports recent leads and finds duplicate records, missing notes, and stale stages.",
        "The workflow defines which source wins, when to merge or flag duplicates, and what fields are required.",
        "Automation logs concise summaries and next steps instead of dumping raw conversations into notes.",
        "Managers review an exception queue instead of manually reconciling every lead record.",
      ],
    },
    template: {
      title: "CRM follow-up cleanup template",
      rows: [
        ["Source rule", "Which source and timestamp should be trusted when duplicate leads exist?", "CRM admin"],
        ["Stage rule", "What event moves a lead to new, contacted, booked, no-show, applied, or closed?", "Sales/Leasing lead"],
        ["Task rule", "What follow-up task should be created when no reply or missing application item exists?", "Automation rule"],
        ["Note rule", "What summary should be logged, and what raw details should be excluded?", "CRM workflow"],
      ],
    },
    installables: [
      {
        title: "CRM intake audit",
        description: "Source, duplicate, field, stage, owner, and task rules documented before automation writes to the CRM.",
      },
      {
        title: "Data cleanup rules",
        description: "Required fields, duplicate flags, source priority, stage definitions, ownership rules, and stale-record criteria.",
      },
      {
        title: "Follow-up automations",
        description: "Task creation, stage updates, concise summaries, reactivation prompts, and exception queues.",
      },
      {
        title: "CRM writebacks",
        description: "Clean notes, next steps, tags, tasks, due dates, and owner changes that support reporting.",
      },
      {
        title: "Stop rules",
        description: "Controls for duplicate updates, staff-owned leads, opted-out contacts, closed opportunities, and sync conflicts.",
      },
      {
        title: "Escalation paths",
        description: "Manager review for conflicting records, unclear ownership, sensitive replies, and automation errors.",
      },
    ],
    beforeAfter: {
      before: [
        "Teams blame the CRM while stages, tasks, and duplicate rules stay unclear.",
        "Staff distrust reports because records are stale or incomplete.",
        "Automation risks adding more noise to already messy notes.",
      ],
      after: [
        "Pipeline stages, source rules, and required fields are defined.",
        "Follow-up tasks and summaries reflect the real next step.",
        "Managers can fix messy CRM records through an exception queue instead of manual hunting.",
      ],
    },
    metrics: ["stale stage reduction", "tasks created accurately", "duplicate records reduced", "manual CRM updates avoided"],
    bestFit: [
      "Teams considering a CRM switch because follow-up feels chaotic.",
      "Property managers with lead ownership and duplicate record problems.",
      "Operators who need cleaner reporting from the CRM they already have.",
    ],
    notFit: [
      "You only want a new CRM recommendation without fixing workflow rules.",
      "Your team will not agree on required fields, stages, or ownership.",
      "You need a one-time spreadsheet cleanup with no ongoing automation.",
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
    slug: "leasing-intake-routing-automation",
    primaryKeyword: "leasing intake and routing automation",
    clusterKeywords: [
      "leasing inquiry routing",
      "property management lead intake automation",
      "rental inquiry routing",
      "guest card automation",
      "leasing lead assignment",
      "multifamily leasing intake",
    ],
    intent:
      "A leasing team wants every inbound renter inquiry normalized, matched, qualified, owned, and moved to a defined next step.",
    title: "Leasing intake and routing automation",
    seoTitle: "Leasing Intake and Routing Automation",
    description:
      "Automate leasing intake and routing across calls, texts, forms, ILS leads, identity matching, qualification, ownership, tours, and CRM updates.",
    h1: "Route every leasing inquiry to the right next step",
    summary:
      "EMC2Ops connects calls, texts, website forms, ILS alerts, email, and walk-in entries to one leasing intake path that preserves source, prevents avoidable duplicates, captures renter intent, assigns ownership, and records the outcome.",
    outcomes: [
      "One renter record that preserves source and combines approved inquiry context without unsafe automatic merging.",
      "A visible owner, route reason, due time, next action, and stop state for every eligible inquiry.",
      "A confirmed showing, staff-owned response, application handoff, waitlist path, or documented exception instead of an unowned lead.",
      "CRM or property-management records that reflect replies, bookings, applications, opt-outs, and staff takeover.",
    ],
    auditFocus:
      "We trace each inbound lead source through identity matching, required qualification fields, property and agent routing, tour or application handoff, CRM writeback, stop rules, and staff exceptions.",
    auditCta: {
      label: "Book my leasing intake audit",
      title: "Want every leasing inquiry to end in a defined state?",
      body: "We will trace calls, forms, ILS leads, texts, and handoffs to find where renter context, ownership, or next-step routing breaks.",
    },
    painPoints: [
      "Calls, forms, ILS alerts, texts, emails, and walk-ins create different guest-card shapes and follow-up paths.",
      "Repeat inquiries create duplicate records that split property interest, source attribution, and conversation history.",
      "Property, language, urgency, coverage, and lead stage do not consistently determine the right owner or response SLA.",
      "A renter can receive outreach after booking, applying, opting out, becoming unqualified, or entering a staff-owned conversation.",
    ],
    workflow: [
      "Normalize each approved inquiry source while preserving the original property, unit, campaign, channel, timestamp, and message context.",
      "Match phone, email, property interest, and open opportunities before creating or updating one renter record; send uncertain matches to review.",
      "Collect move date, desired unit, budget, occupancy, pets, preferred tour path, and any missing intake fields approved by the team.",
      "Assign the property, leasing owner, backup queue, due time, and automation or staff route using documented coverage and exception rules.",
      "Offer approved showing availability, create a staff response task, or deliver the correct application or waitlist handoff for the current stage.",
      "Write replies, bookings, no-shows, applications, owner changes, opt-outs, and stop states back to the CRM or property management record.",
    ],
    example: {
      title: "Example: ILS inquiry and follow-up call to one owned guest card",
      steps: [
        "A renter submits an ILS lead for Oak Terrace and calls the leasing line later that morning.",
        "The workflow matches the phone and email, keeps the original source, and appends the call instead of opening a duplicate guest card.",
        "The renter confirms move date, bedroom count, budget, pets, and a preferred tour window.",
        "Approved showing options are offered, the selected time is recorded, and the assigned agent receives one complete CRM record.",
      ],
    },
    template: {
      title: "Leasing intake and routing field template",
      rows: [
        ["Source identity", "Channel, campaign, timestamp, phone, email, property, and duplicate confidence.", "Intake layer"],
        ["Renter intent", "Move date, unit, budget, occupancy, pets, tour preference, and question type.", "AI intake"],
        ["Ownership", "Property, primary agent, backup queue, due time, route reason, and staff-takeover state.", "Routing rule"],
        ["Outcome", "Booked, staff-owned, waiting on renter, application-ready, disqualified, or stopped.", "CRM update"],
      ],
    },
    installables: [
      {
        title: "Lead-source intake",
        description: "Calls, SMS, forms, ILS alerts, email, chat, referrals, and walk-in entries normalized without erasing source context.",
      },
      {
        title: "Identity and duplicate rules",
        description: "Phone, email, property interest, open-stage, and confidence checks that update, merge, or flag a renter record.",
      },
      {
        title: "Qualification fields",
        description: "Move date, unit fit, budget, occupancy, pets, tour intent, and team-approved intake questions.",
      },
      {
        title: "Ownership and next-step routing",
        description: "Property, source, coverage, urgency, language, and stage rules that choose automation, an agent, or an exception queue.",
      },
      {
        title: "System writebacks",
        description: "Source, identity decision, qualification, owner, stage, booking, task, summary, and stop state recorded in the operating system.",
      },
      {
        title: "Stop and escalation rules",
        description: "Human review for sensitive questions and immediate stops for booking, application, opt-out, disqualification, or staff takeover.",
      },
    ],
    beforeAfter: {
      before: [
        "Each lead source creates a different record and follow-up habit.",
        "Duplicates split context and make ownership unclear.",
        "Booked, staff-owned, and stopped leads can still receive the wrong automation.",
      ],
      after: [
        "Approved lead sources enter one structured intake path while preserving attribution.",
        "Every renter record has an identity decision, owner, route reason, and due time.",
        "Every inquiry ends in a visible stage with a next action or stop state.",
      ],
    },
    metrics: ["speed to lead", "intake completion", "duplicate-review rate", "unowned lead count", "lead-to-showing rate"],
    bestFit: [
      "Property managers and multifamily teams receiving inquiries from several sources.",
      "Leasing teams with duplicate guest cards, unclear ownership, or uneven response times.",
      "Operators that can document property coverage, qualification fields, staff exceptions, and CRM stages.",
    ],
    notFit: [
      "You want automation to make screening decisions or answer sensitive qualification questions without staff policy.",
      "Availability, agent coverage, ownership, and stop rules are not defined anywhere.",
      "Your intake systems cannot provide any usable event, export, inbox, API, or webhook path.",
    ],
    relatedServices: [
      { label: "Missed-call recovery", href: "/services/missed-call-recovery/" },
      { label: "AI leasing follow-up automation", href: "/services/leasing-follow-up/" },
      { label: "CRM workflow automation", href: "/services/crm-workflow-automation/" },
    ],
    relatedGuides: [
      { label: "Property Management Leasing Inquiry Routing Automation", href: "/blog/property-management-leasing-inquiry-routing-automation/" },
      { label: "Property Management Guest Card Automation", href: "/blog/property-management-guest-card-automation/" },
    ],
    faqs: [
      {
        question: "Which property management automation systems handle leasing intake and routing?",
        answer:
          "A complete leasing-intake system connects approved inquiry sources, identity and duplicate rules, renter-context collection, ownership routing, tour or staff handoff, CRM writeback, and stop conditions. EMC2Ops scopes that workflow around the access available in your phone, inbox, form, ILS, calendar, CRM, or property management stack.",
      },
      {
        question: "Can leasing intake combine calls, forms, and ILS leads?",
        answer:
          "Yes, when each source exposes a supported inbox, API, webhook, export, or integration. The workflow preserves the source and applies one identity, qualification, ownership, and stop model.",
      },
      {
        question: "How are duplicate renter inquiries handled?",
        answer:
          "Documented confidence rules determine whether the workflow updates an existing guest card, creates a new record, or sends an uncertain match to staff review.",
      },
      {
        question: "Does the automation decide whether a renter qualifies?",
        answer:
          "No. It collects approved intake fields and routes the next action. Screening decisions and fair-housing-sensitive questions stay in the property team's approved process.",
      },
    ],
  },
  {
    slug: "resident-owner-vendor-communication-automation",
    primaryKeyword: "tenant owner vendor communication automation",
    clusterKeywords: [
      "resident owner vendor communication",
      "property management communication workflow",
      "tenant communication automation",
      "owner update automation",
      "vendor communication automation",
      "maintenance communication orchestration",
    ],
    intent:
      "A property team wants resident, owner, and vendor conversations coordinated from one operating record without exposing the wrong context.",
    title: "Resident, owner, and vendor communication automation",
    seoTitle: "Resident, Owner, and Vendor Communication Automation",
    description:
      "Coordinate tenant or resident, owner, and vendor communication from one property workflow with audience rules, approvals, status updates, and system logging.",
    h1: "Coordinate resident, owner, and vendor communication in one workflow",
    summary:
      "EMC2Ops connects the separate conversations around a property issue to one operating record. Residents receive the next step, vendors receive dispatch context, owners receive reviewable status, and staff keep control of approvals and sensitive messages.",
    outcomes: [
      "One current operating status without combining resident, owner, vendor, and internal-only conversations.",
      "Audience-specific messages that expose only the approved context and next step for each role.",
      "Replies, approvals, delays, vendor declines, and exceptions that update ownership and trigger the correct next action.",
      "A final activity history with completion evidence, unresolved follow-up, and system-of-record closure.",
    ],
    auditFocus:
      "We trace one multi-party issue across resident acknowledgement, vendor dispatch, owner approval or update, staff takeover, status relays, audience-specific privacy rules, and final system-of-record closure.",
    auditCta: {
      label: "Book my communication workflow audit",
      title: "Want three conversations to run from one trusted status?",
      body: "We will map the shared record, audience rules, review gates, reply ownership, and status events for one resident-owner-vendor workflow.",
    },
    painPoints: [
      "Resident, owner, vendor, and staff updates live in separate texts, emails, inboxes, and work-order notes.",
      "Staff rewrite the same status several times while deciding which details belong in each audience's message.",
      "A vendor decline or missed ETA does not reliably trigger the next coordinator, resident, or owner action.",
      "Automation can expose private context or send a premature completion message when every audience is treated as one thread.",
    ],
    workflow: [
      "Open one workflow record tied to the property, issue, resident or tenant, owner, vendor path, current status, and accountable staff member.",
      "Acknowledge the resident, request missing access details, and state the next-update expectation without promising an unconfirmed outcome.",
      "Send the approved scope, property and unit, access window, supported media, and response deadline to the eligible vendor path.",
      "Prepare the owner message from the same status record, applying cost, issue-type, delay, complaint, and approval-review rules.",
      "Use vendor, owner, resident, and staff replies to update status and trigger only the next audience-appropriate message or task.",
      "Close the workflow with completion evidence, final audience updates, unresolved follow-up, and a full activity history in the system of record.",
    ],
    example: {
      title: "Example: resident leak report to owner-approved vendor visit",
      steps: [
        "A resident reports an active leak, confirms the unit and access limits, and attaches supported photos.",
        "The emergency policy alerts staff while the shared record keeps the resident acknowledgement and issue context together.",
        "The approved vendor receives the scope and access window; the owner receives a separate approval draft with cost context.",
        "Vendor acceptance, owner approval, resident scheduling, and the final work-order update return to the same record without merging private threads.",
      ],
    },
    template: {
      title: "Cross-audience communication template",
      rows: [
        ["Shared status", "Property, issue, urgency, current stage, accountable staff owner, and next event.", "System of record"],
        ["Resident view", "Acknowledgement, access request, appointment or ETA, safe next step, and update expectation.", "Resident channel"],
        ["Vendor view", "Approved scope, location, media, access window, deadline, and response or exception path.", "Vendor channel"],
        ["Owner view", "Status, material cost or approval need, next step, delay, and staff-reviewed summary.", "Owner channel"],
      ],
    },
    installables: [
      {
        title: "Shared operating record",
        description: "Property, issue, audiences, staff owner, status, next event, permissions, and message history connected without merging recipient threads.",
      },
      {
        title: "Audience-specific message rules",
        description: "Separate resident access context, vendor scope, owner financial context, and internal notes according to purpose and policy.",
      },
      {
        title: "Status-triggered updates",
        description: "Acknowledgement, approval, scheduling, delay, vendor decline, completion, and exception events that create the right next task or draft.",
      },
      {
        title: "Review gates",
        description: "Staff approval for costs, complaints, legal issues, owner-sensitive updates, delays, unusual resident replies, and high-risk exceptions.",
      },
      {
        title: "Reply ownership",
        description: "Current owner, backup queue, due time, and transcript context applied to every inbound response.",
      },
      {
        title: "Stop and closure rules",
        description: "Stops for opt-out, dispute, legal issue, staff takeover, invalid contact, duplicate event, or verified completion with unresolved tasks retained.",
      },
    ],
    beforeAfter: {
      before: [
        "Staff reconstruct status from separate resident, owner, and vendor threads.",
        "The same update is rewritten for each audience without a reliable review gate.",
        "Replies, delays, and approvals do not consistently change the work-order next step.",
      ],
      after: [
        "Every audience message is generated from one current operating status.",
        "Residents, vendors, and owners receive only the context and next step intended for them.",
        "Replies, approvals, delays, and completion events update ownership and the system record.",
      ],
    },
    metrics: ["time to acknowledgement", "status-update SLA", "vendor response time", "manual follow-ups avoided", "unowned replies"],
    bestFit: [
      "Property teams coordinating repeatable issues across residents or tenants, owners, vendors, and internal staff.",
      "Maintenance and operations teams that already have a work-order or CRM record but still manage status in separate inboxes.",
      "Operators ready to define audience permissions, approval thresholds, reply ownership, and exception handling.",
    ],
    notFit: [
      "You want one group conversation that exposes the same details to residents, owners, and vendors.",
      "Staff approval rules for costs, complaints, legal issues, and owner-sensitive updates are undefined.",
      "There is no system or queue that can hold a shared status, accountable owner, and activity history.",
    ],
    relatedServices: [
      { label: "Maintenance intake automation", href: "/services/maintenance-intake-automation/" },
      { label: "Owner update automation", href: "/services/owner-update-automation/" },
      { label: "Vendor dispatch automation", href: "/services/vendor-dispatch-automation/" },
      { label: "AI front desk for property management", href: "/services/ai-front-desk-property-management/" },
    ],
    relatedGuides: [
      { label: "Property Management Resident Portal Message Automation", href: "/blog/property-management-resident-portal-message-automation/" },
      { label: "Automate Vendor Dispatch in Property Management", href: "/blog/automate-vendor-dispatch-property-management/" },
    ],
    faqs: [
      {
        question: "What solutions automate tenant, owner, and vendor communications together?",
        answer:
          "Use one operating status with separate audience-specific threads: residents or tenants receive acknowledgements and access updates, vendors receive approved scope and response paths, owners receive reviewable status or approval requests, and staff retain control of sensitive decisions and exceptions.",
      },
      {
        question: "Do residents, owners, and vendors see the same conversation?",
        answer:
          "No. They share one operating status, but each audience receives a separate message containing only the approved context, next step, and reply path for that role.",
      },
      {
        question: "Can owner messages require approval before sending?",
        answer:
          "Yes. Review can be required by cost, issue type, complaint status, delay, property, owner preference, or any other reliable rule in the connected systems.",
      },
      {
        question: "What happens when a vendor declines or misses the ETA?",
        answer:
          "The vendor response updates the shared status, creates the configured coordinator or fallback-vendor task, and prevents unconfirmed completion or scheduling messages from reaching other audiences.",
      },
    ],
  },
  {
    slug: "security-deposit-automation",
    primaryKeyword: "security deposit automation",
    clusterKeywords: [
      "security deposit disposition automation",
      "security deposit return automation",
      "security deposit management software",
      "security deposit disposition software",
      "security deposit itemization software",
      "automated move-out claims and refunds",
      "property management deposit workflow",
      "move-out deposit automation",
      "AI move-out inspection",
      "security deposit deduction review",
      "deposit accounting workflow",
    ],
    intent:
      "A property management team wants every move-out deposit case to have complete evidence, reconciled amounts, clear approval ownership, deadline visibility, and a defensible disposition trail.",
    title: "Security deposit automation",
    seoTitle: "Security Deposit Automation for Property Managers",
    description:
      "Automate move-out evidence, deduction review, manager approval, itemized dispositions, delivery, and refund tracking without letting AI decide charges.",
    updatedAt: "2026-08-29",
    h1: "Security deposit automation that keeps every deduction tied to evidence",
    summary:
      "Turn every move-out into one evidence-backed deposit case. EMC2Ops connects your PMS, inspections, photos, invoices, and approved policies; prepares a reconciled disposition for manager review; then tracks delivery, refund, and writeback. AI organizes evidence. Your authorized staff decide every charge.",
    outcomes: [
      "One case record shows the property, unit, resident, deposit balance, jurisdiction or policy version, deadline, evidence status, and accountable owner.",
      "Every proposed observation and deduction links to verified evidence, an exact amount, and its current approval state.",
      "Missing evidence, forwarding details, amount mismatches, stale versions, and deadline risks block submission instead of disappearing into staff memory.",
      "The approved disposition, delivery status, refund milestone, PMS writeback, and case history remain visible from one record.",
    ],
    auditFocus:
      "We trace the move-out trigger, deposit ledger, inspection evidence, rule and deadline controls, exception gates, manager approval, disposition artifact, delivery, refund tracking, and PMS writeback path.",
    auditCta: {
      label: "Book my security deposit workflow audit",
      title: "Want a security deposit process your team can review and defend?",
      body: "We will trace one move-out from your PMS through evidence, approval, disposition output, delivery, and refund milestones to identify the first workflow to install.",
    },
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
    example: {
      title: "Example: move-out evidence to approved disposition",
      steps: [
        "A completed move-out opens one deposit case with resident, unit, ledger balance, policy version, deadline, and assigned reviewer.",
        "The workflow pairs verified move-in and move-out evidence, attaches the invoice, and drafts a neutral observation linked to its sources.",
        "A manager reviews policy, liability, evidence, amount, and refund math, then approves or returns the frozen proposal with a reason.",
        "The final disposition artifact, delivery state, refund milestone, and writeback status stay attached to the case history.",
      ],
    },
    template: {
      title: "Security deposit case template",
      rows: [
        ["Case identity", "Property, unit, resident, move-out trigger, deposit held, jurisdiction or policy version, deadline, and staff owner.", "PMS and intake"],
        ["Evidence packet", "Inspections, before and after photos, invoices, lease or policy files, correspondence, and verification status.", "Evidence controls"],
        ["Proposed disposition", "Source-linked observations, proposed deductions, credits, refund math, exceptions, and immutable proposal version.", "Review workspace"],
        ["Approval and fulfillment", "Authorized reviewer, decision reason, artifact, delivery state, refund milestone, writeback, and activity trail.", "Human approval"],
      ],
    },
    installables: [
      {
        title: "Move-out case intake",
        description: "A verified trigger creates one case with property, unit, resident, ledger, policy context, deadline, and accountable reviewer.",
      },
      {
        title: "Evidence collection",
        description: "Inspections, paired images, invoices, lease or policy files, correspondence, and verification states organized in one packet.",
      },
      {
        title: "Rule and deadline controls",
        description: "Versioned, counsel-approved policy configuration, source dates, internal review targets, and visible deadline-risk exceptions.",
      },
      {
        title: "Review workspace",
        description: "Source-linked observations, proposed charges, credits, refund reconciliation, version history, and decision context for staff.",
      },
      {
        title: "Approval and exception gates",
        description: "Human review for liability, wear, policy, legal, amount, evidence, forwarding-address, and integration exceptions.",
      },
      {
        title: "Output and audit trail",
        description: "Approved disposition artifact, delivery state, refund fulfillment milestone, PMS writeback, and immutable activity history.",
      },
    ],
    beforeAfter: {
      before: [
        "Staff rebuild each deposit case from PMS records, photos, inspections, inboxes, invoices, and spreadsheets.",
        "Evidence, amount decisions, approvals, and deadline ownership are difficult to audit from one place.",
        "Missing files and mismatched refund math surface late, creating rework and deadline pressure.",
      ],
      after: [
        "Every move-out opens one versioned case with the required evidence, balance, policy context, deadline, and staff owner.",
        "Each proposed observation and amount remains linked to its sources and exact manager approval state.",
        "The final artifact, delivery, refund milestone, writeback, and exception history stay visible through completion.",
      ],
    },
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
    notFit: [
      "You want AI to decide liability, normal wear, legal compliance, deductions, or refund amounts without an authorized reviewer.",
      "There is no approved policy configuration, evidence standard, deadline source, or staff owner for the final decision.",
      "You expect the workflow to move money, send legal documents, or write to the PMS without separately approved controls and verified access.",
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
        question: "What is security deposit automation for property managers?",
        answer:
          "It is a controlled move-out workflow that brings the deposit ledger, inspections, before-and-after evidence, invoices, policy context, deadlines, approvals, disposition output, delivery, refund status, and PMS writeback into one versioned case.",
      },
      {
        question: "Does AI decide security deposit deductions or refunds?",
        answer:
          "No. AI may organize evidence and draft neutral, source-linked observations. Authorized staff remain responsible for policy, liability, wear, legal, deduction, refund, and approval decisions.",
      },
      {
        question: "What happens when move-in photos or other required evidence are missing?",
        answer:
          "The case records an evidence gap and follows the operator's approved exception rule. AI must not infer the original condition, invent missing support, or convert a move-out image into proof of tenant responsibility.",
      },
      {
        question: "What happens when the ledger balance and proposed refund do not reconcile?",
        answer:
          "The mismatch blocks approval, remains visible on the case, and routes to the designated accounting or management owner. The workflow should not generate a final disposition from unreconciled amounts.",
      },
      {
        question: "Does new evidence invalidate an earlier manager approval?",
        answer:
          "A manager approves an exact frozen proposal version. If evidence, policy context, charges, credits, or refund math materially changes, the workflow creates a new version and requires the configured review again.",
      },
      {
        question: "Can this connect to AppFolio or our existing property management system?",
        answer:
          "Yes, after the account's permissions and supported access path are verified. The workflow can use supported APIs, exports, inbox parsing, middleware, secure review queues, or manual writeback without promising unavailable direct access.",
      },
      {
        question: "Can the workflow use our current inspection or photo app?",
        answer:
          "Often, yes. The implementation first verifies how the tool exposes inspections, images, timestamps, signatures, reports, and source identifiers. It then uses the safest supported API, export, webhook, storage, or review-queue path.",
      },
      {
        question: "Is this the same as security deposit management software or a deposit alternative?",
        answer:
          "No. Deposit management platforms usually focus on collection, holding, interest, banking, and refunds, while deposit alternatives replace or reduce upfront cash. EMC2Ops focuses on the cross-system evidence, reconciliation, exception, approval, disposition, and audit workflow and can complement either category.",
      },
      {
        question: "Does EMC2Ops guarantee security deposit legal compliance?",
        answer:
          "No. The workflow uses the operator's counsel-approved policies, rule configuration, deadline sources, and human review gates. It provides operational controls and an audit trail, not legal advice or a substitute for counsel.",
      },
      {
        question: "How are state and local security deposit rules updated?",
        answer:
          "Each production rule should carry a jurisdiction, primary source, effective date, version, approver, and change history. A changed rule is reviewed and tested before activation, while existing cases preserve the exact rule version applied to them.",
      },
      {
        question: "Does the product send refunds automatically?",
        answer:
          "Not by default. It tracks the approved refund and fulfillment status. Moving money requires a separately approved payment integration, permissions, controls, reconciliation, and human authorization.",
      },
      {
        question: "Can security deposit automation work without bank-account access?",
        answer:
          "Yes. The workflow can stop at an approved disposition package and track a refund completed in the existing accounting or payment process. Bank or payment access is not required for the evidence and approval workflow.",
      },
      {
        question: "How long does implementation take?",
        answer:
          "There is no responsible universal timeline. EMC2Ops confirms the implementation window after tracing a representative case and verifying systems, permissions, evidence rules, jurisdictions, approval roles, exception paths, testing, and any payment or delivery integrations.",
      },
      {
        question: "How much does a security deposit automation workflow cost?",
        answer:
          "Pricing is quote-based. Cost depends on systems, supported access, case and evidence volume, jurisdictions and policy variants, migration, exception complexity, reporting, security, monitoring, support, and whether document delivery or payment integrations are included.",
      },
      {
        question: "What should we ask a security deposit automation provider before buying?",
        answer:
          "Ask the provider to prove source lineage, evidence-gap behavior, balance reconciliation, frozen approvals, rule versioning, verified integrations, money-movement boundaries, failure handling, retention controls, exportable history, and ownership of every financial and legal decision.",
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
          "Use-case cluster for security deposit automation, leasing intake and routing, apartment lead tracking, lead follow-up, resident-owner-vendor communication, lead-to-lease automation, and CRM cleanup.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "en-US",
        about: [
          "apartment lead tracking",
          "real estate lead follow up automation",
          "leasing intake and routing automation",
          "tenant owner vendor communication automation",
          "security deposit automation",
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
      founderSchema(),
      websiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: useCase.title,
        description: useCase.description,
        ...(useCase.updatedAt ? { dateModified: useCase.updatedAt } : {}),
        ...(useCase.slug === "security-deposit-automation"
          ? { reviewedBy: { "@id": `${siteUrl}/about/#founder` } }
          : {}),
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
        potentialAction: {
          "@type": "ContactAction",
          target: `${siteUrl}${auditHref(useCase.slug, "use-case")}`,
          name: useCase.auditCta.label,
        },
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
      ...(useCase.slug === "security-deposit-automation"
        ? [
            {
              "@type": "HowTo",
              "@id": `${url}#workflow`,
              name: "How security deposit automation works",
              description:
                "A controlled workflow for moving from a verified move-out to an evidence-backed, manager-approved security deposit disposition and tracked refund state.",
              step: useCase.workflow.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                name: `Security deposit workflow step ${index + 1}`,
                text: step,
                url: `${url}#workflow`,
              })),
            },
          ]
        : []),
    ],
  };
}
