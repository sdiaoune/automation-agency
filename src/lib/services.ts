import { absoluteUrl, organizationSchema, siteUrl, websiteSchema } from "./site";
import { auditHref, type AuditCta, type BeforeAfter, type InstallableItem } from "./conversion";

export interface ServicePage {
  slug: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  auditFocus: string;
  auditCta: AuditCta;
  installables: InstallableItem[];
  beforeAfter: BeforeAfter;
  bestFit: string[];
  notFit: string[];
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
      "Turn missed leasing calls into qualified conversations and booked showings with SMS follow-up, scheduling, staff routing, and CRM logging.",
    summary:
      "EMC2Ops installs apartment call tracking and the complete missed-call-to-showing workflow: detect the unanswered call, text the renter, capture leasing intent, offer an approved booking path, and record the confirmed next step.",
    auditFocus:
      "We map your unanswered-call trigger, first SMS, renter qualification fields, approved showing inventory, booking handoff, CRM writeback, stop rules, and staff escalation path.",
    auditCta: {
      label: "Book my missed-call audit",
      title: "Want missed leasing calls routed before they go cold?",
      body: "Bring your phone system, CRM, and current missed-call process. We will identify the first recoverable workflow and the safest handoff rules.",
    },
    installables: [
      {
        title: "Missed-call trigger",
        description: "A phone or call-routing event that starts follow-up only when a leasing call is actually missed.",
      },
      {
        title: "Renter detail capture",
        description: "Move date, unit interest, budget, pets, tour intent, and property interest collected before staff step in.",
      },
      {
        title: "Text-back sequence",
        description: "Short branded SMS prompts that recover the conversation without pretending to be a human agent.",
      },
      {
        title: "Showing and staff route",
        description: "Approved showing options for schedule-ready renters, plus an owned staff task when pricing, fit, or availability needs judgment.",
      },
      {
        title: "Stop rules",
        description: "Suppression when a prospect replies, books, opts out, becomes unqualified, or a human takes over.",
      },
      {
        title: "Escalation path",
        description: "Rules for high-intent renters, unclear questions, fair-housing-sensitive replies, and urgent staff review.",
      },
    ],
    beforeAfter: {
      before: [
        "Missed calls create voicemail, sticky notes, and delayed callbacks.",
        "Managers cannot tell which calls became real prospects.",
        "CRM records depend on whoever remembers to type the update.",
      ],
      after: [
        "Every missed leasing call receives a fast, branded next step.",
        "Qualified replies reach an approved showing path or a clearly owned staff task.",
        "The CRM shows whether the renter booked, needs follow-up, or reached a stop condition.",
      ],
    },
    bestFit: [
      "You miss renter calls during tours, lunch breaks, evenings, or weekends.",
      "Your phone system and CRM do not share enough follow-up context.",
      "You want a narrow first automation with measurable reply and booking impact.",
    ],
    notFit: [
      "You only need a phone tree or answering service with no CRM handoff.",
      "Your team cannot define who should own a recovered prospect.",
      "You are not ready to review opt-out, consent, and staff handoff rules.",
    ],
    outcomes: [
      "Text prospects back automatically after missed calls.",
      "Collect move date, unit interest, budget, pets, and showing intent.",
      "Offer approved showing options or route a staff-owned next step.",
      "Write the booking, owner, stage, summary, and stop state back to the CRM.",
    ],
    workflow: [
      "Confirm the leasing call was missed and check the number against existing lead, staff-takeover, and suppression records.",
      "Send a branded text-back that identifies the property team and gives the renter one clear reply path.",
      "Capture property interest, move date, unit fit, budget, pets, occupancy, and showing intent in structured fields.",
      "Offer only approved showing availability when the renter is schedule-ready; otherwise assign the right leasing owner with context.",
      "Confirm the selected showing and send the approved confirmation or reminder details.",
      "Write the source, conversation summary, showing, owner, stage, task, and stop state to the CRM.",
    ],
    metrics: ["missed calls recovered", "time to first response", "qualified replies", "call-to-showing rate"],
    faqs: [
      {
        question: "What automation should I install first if my leasing team misses calls?",
        answer:
          "Start with a missed-call-to-showing workflow: verify the missed call, send an approved text-back, capture renter intent, offer supported showing availability or assign staff, and write the confirmed outcome and stop state to the CRM.",
      },
      {
        question: "How fast does missed-call recovery respond?",
        answer:
          "The workflow is designed to respond as soon as the connected phone provider supplies an eligible missed-call event. Actual timing depends on provider delivery, workflow configuration, and channel availability, so EMC2Ops measures the timestamps instead of promising a universal response time.",
      },
      {
        question: "Can it stop when a human responds?",
        answer: "Yes. We design stop rules so automation does not fight the leasing team once a human takes over.",
      },
      {
        question: "Can a recovered caller book a showing without staff copy-paste?",
        answer: "Yes, when approved availability can be read from your scheduling process. The workflow records the booking and routes pricing, availability, accommodation, or other exceptions to staff.",
      },
      {
        question: "How does apartment call tracking work after a missed leasing call?",
        answer:
          "Apartment call tracking connects the phone event to the renter, property, source, qualification details, staff owner, follow-up status, and CRM outcome instead of leaving the call as an isolated voicemail.",
      },
    ],
    relatedUseCases: [
      {
        label: "Leasing intake and routing automation",
        href: "/use-cases/leasing-intake-routing-automation/",
        description: "Normalize calls, texts, forms, and ILS inquiries before ownership, booking, and CRM writeback.",
      },
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
    title: "Leasing lead automation for property managers",
    seoTitle: "Leasing Lead Automation for Property Managers",
    description:
      "Install leasing lead automation for missed inquiries, stale replies, no-shows, and incomplete applications with CRM updates and human stop rules.",
    summary:
      "EMC2Ops installs leasing lead automation that keeps renter follow-up moving after the first inquiry, missed call, tour, no-show, stale reply, or incomplete application.",
    auditFocus:
      "We audit the first inquiry, tour, no-show, stale reply, application, and handoff stages so follow-up moves leads forward without over-messaging.",
    auditCta: {
      label: "Book my leasing follow-up audit",
      title: "Want leasing follow-up that knows when to stop?",
      body: "We will review your lead sources, stage timing, message rules, CRM updates, and human takeover points before recommending the first sequence.",
    },
    installables: [
      {
        title: "Stage triggers",
        description: "Rules for missed inquiry, stale reply, booked tour, no-show, incomplete application, and stalled approval moments.",
      },
      {
        title: "Context fields",
        description: "Property, source, move date, unit fit, last action, consent status, owner, and next required step captured before outreach.",
      },
      {
        title: "Follow-up automations",
        description: "SMS, email, reminders, rebooking paths, and task creation matched to the renter's current stage.",
      },
      {
        title: "CRM writebacks",
        description: "Concise notes, tags, tasks, and stage updates that show what happened without flooding the record.",
      },
      {
        title: "Stop rules",
        description: "Automation pauses when a renter replies, books, applies, opts out, is disqualified, or a staff member takes ownership.",
      },
      {
        title: "Escalation paths",
        description: "Questions about pricing, accommodations, complaints, approvals, or unusual situations go to a human with context.",
      },
    ],
    beforeAfter: {
      before: [
        "Every lead gets similar follow-up regardless of stage or urgency.",
        "No-shows and incomplete applications wait for manual attention.",
        "The CRM shows activity but not a trustworthy next action.",
      ],
      after: [
        "Follow-up changes by stage, source, timing, and last renter action.",
        "Stalled renters get a clear booking, rebooking, or application path.",
        "Staff see concise tasks and know when automation already handled the next touch.",
      ],
    },
    bestFit: [
      "You have enough renter volume that missed second touches cost real leases.",
      "Your team needs SMS, email, CRM tasks, and human handoffs working together.",
      "You want automation that respects bookings, opt-outs, staff replies, and sensitive questions.",
    ],
    notFit: [
      "You want one generic drip sequence for every lead source and property.",
      "You do not have a clear leasing stage model or owner assignment rule.",
      "You are looking for a bulk outbound campaign instead of workflow follow-up.",
    ],
    outcomes: [
      "Recover prospects who stopped replying after first contact, tour requests, or application links.",
      "Send showing reminders, confirmations, no-show recovery prompts, and rebooking paths.",
      "Update CRM stages, tasks, owners, and suppression rules when a prospect replies, books, no-shows, applies, or opts out.",
    ],
    workflow: [
      "A renter lead enters your CRM, inbox, phone system, or form stack.",
      "The workflow checks stage, source, timing, consent, last touch, and whether staff already took over.",
      "Prospects receive short, branded prompts to book, confirm, reschedule, complete an application, or clarify interest.",
      "Replies, stop signals, bookings, no-shows, and owner handoffs are synced back to the operating system of record.",
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
      {
        question: "Can follow-up stop when a prospect books or staff replies?",
        answer: "Yes. Stop rules are core to the workflow so automation pauses when a prospect books, applies, opts out, becomes unqualified, or a human takes over.",
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
      "EMC2Ops installs maintenance intake workflows that gather the issue, urgency, access notes, supported photos or video, and resident availability before routing a usable work-order record.",
    auditFocus:
      "We review request channels, required work-order details, emergency indicators, access notes, photo handling, vendor routing, and approval rules.",
    auditCta: {
      label: "Book my maintenance intake audit",
      title: "Want cleaner maintenance requests before staff touch them?",
      body: "We will map the first intake workflow that can collect missing details, identify exceptions, and route a usable summary.",
    },
    installables: [
      {
        title: "Request triggers",
        description: "Inbox, form, SMS, resident portal, or phone events that begin intake without forcing staff to retype the request.",
      },
      {
        title: "Details and media",
        description: "Issue type, exact location, urgency, access notes, resident availability, supported photos or video, pets, and prior attempts.",
      },
      {
        title: "Intake automations",
        description: "Follow-up prompts that gather missing details and create a readable maintenance summary.",
      },
      {
        title: "Work-order handoff",
        description: "Summary, category, urgency, property, media links, access context, and next step routed to the work-order tool, coordinator, or approved vendor path.",
      },
      {
        title: "Stop rules",
        description: "Automation stops when the request is complete, staff take over, a resident opts out, or an emergency path activates.",
      },
      {
        title: "Escalation paths",
        description: "Emergency terms, habitability concerns, repeat issues, approval thresholds, and unclear resident answers route to staff.",
      },
    ],
    beforeAfter: {
      before: [
        "Coordinators chase basic details before a request can be routed.",
        "Urgent and routine requests arrive in the same queue.",
        "Vendors receive incomplete context and send avoidable follow-up questions.",
      ],
      after: [
        "Residents are prompted for the details and supported photos staff normally have to chase.",
        "Emergency and exception signals route separately from routine intake.",
        "Coordinators, vendors, and approval owners receive the right context with the next action attached.",
      ],
    },
    bestFit: [
      "Your team receives repetitive maintenance requests through several channels.",
      "Staff spend time chasing photos, access notes, and basic troubleshooting details.",
      "You need exception handling before expanding to vendor dispatch automation.",
    ],
    notFit: [
      "You want automation to approve costly repairs without human review.",
      "Emergency handling policies are undefined or inconsistent by property.",
      "Residents must only use a locked portal and no adjacent intake path is allowed.",
    ],
    outcomes: [
      "Capture issue type, exact location, urgency, access notes, resident availability, and supported photos or video.",
      "Separate emergencies from standard maintenance requests.",
      "Route dispatch-ready summaries to coordinators, approved vendors, owner-approval queues, or the work-order system.",
      "Acknowledge the resident and record the expected next update after routing.",
    ],
    workflow: [
      "Match the resident, property, unit, contact channel, and any related open work order.",
      "Check emergency and habitability indicators first so urgent requests bypass routine intake.",
      "Collect the issue category, exact location, symptoms, timing, access permission, pets, and resident availability.",
      "Request supported photos or video and attach each file or secure media link to the correct request.",
      "Apply property, trade, coverage, warranty, urgency, approval, and preferred-vendor routing rules.",
      "Create or update the work order, acknowledge the resident, and log the coordinator, vendor, or approval owner and next update time.",
    ],
    metrics: ["intake completion", "photo completion", "dispatch readiness", "time to route"],
    faqs: [
      {
        question: "How do I automate tenant maintenance intake with photos and routing?",
        answer:
          "Connect the approved resident channel to a structured intake that verifies the property and unit, checks emergency indicators, collects issue details and supported media, applies approval and routing rules, creates or updates the work order, and records who owns the next update.",
      },
      {
        question: "Can this handle emergency maintenance?",
        answer: "It can identify emergency indicators and escalate, but final emergency handling rules should match your operating policy.",
      },
      {
        question: "Can residents send photos?",
        answer: "Yes, when the selected messaging channel and maintenance system support media. The implementation defines file limits, retention, access controls, and how each photo or link attaches to the work order.",
      },
      {
        question: "Can the workflow route directly to a vendor?",
        answer: "Only for categories, properties, vendors, and approval thresholds your team defines. Emergencies, high-cost work, unclear access, duplicate requests, and other exceptions route to staff.",
      },
    ],
    relatedUseCases: [
      {
        label: "Resident, owner, and vendor communication automation",
        href: "/use-cases/resident-owner-vendor-communication-automation/",
        description: "Coordinate acknowledgements, dispatch, approvals, status relays, and closure without merging private threads.",
      },
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
    auditFocus:
      "We inspect how conversations become CRM records, where duplicate records appear, what fields matter, and which tasks or stages should update automatically.",
    auditCta: {
      label: "Book my CRM workflow audit",
      title: "Want your CRM to show the real next step?",
      body: "We will review your current stages, fields, notes, duplicate rules, task triggers, and reporting gaps before proposing the first cleanup workflow.",
    },
    installables: [
      {
        title: "Workflow triggers",
        description: "Calls, texts, forms, inbox events, bookings, no-shows, approvals, and status changes that should update the CRM.",
      },
      {
        title: "Data captured",
        description: "Source, stage, owner, outcome, next step, due time, lead identity, property, and exception notes.",
      },
      {
        title: "Automation rules",
        description: "Task creation, stage movement, tagging, dedupe checks, summary generation, and owner assignment.",
      },
      {
        title: "CRM writebacks",
        description: "Clean notes and structured fields instead of raw conversation dumps or disconnected task lists.",
      },
      {
        title: "Stop rules",
        description: "Guards for duplicate updates, staff-owned conversations, closed leads, opted-out contacts, and system sync conflicts.",
      },
      {
        title: "Escalation paths",
        description: "Exception queues for unclear ownership, conflicting records, sensitive replies, and updates that need human approval.",
      },
    ],
    beforeAfter: {
      before: [
        "The CRM has stale stages, duplicate contacts, and inconsistent notes.",
        "Staff keep separate reminders because they do not trust tasks.",
        "Reports lag behind what happened in calls, texts, and inboxes.",
      ],
      after: [
        "Important workflow outcomes update the CRM in a consistent shape.",
        "Tasks, stages, and ownership rules match how the team actually works.",
        "Managers can see which records need attention without manual reconciliation.",
      ],
    },
    bestFit: [
      "Your team is considering a CRM switch because follow-up feels messy.",
      "You have duplicate leads, stale stages, and missing ownership rules.",
      "You need CRM updates tied to actual renter, resident, owner, or vendor workflows.",
    ],
    notFit: [
      "You want every raw message copied into the CRM with no filtering.",
      "Your CRM fields, stages, and ownership rules cannot be changed.",
      "You need a full CRM replacement before workflow cleanup can begin.",
    ],
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
    auditFocus:
      "We identify repeatable owner-update moments, the source data behind them, which messages need approval, and how completed updates should be logged.",
    auditCta: {
      label: "Book my owner update audit",
      title: "Want owner updates without rewriting status notes?",
      body: "We will map the recurring owner questions, status triggers, review gates, and logging path that can safely become an update workflow.",
    },
    installables: [
      {
        title: "Status triggers",
        description: "Leasing, maintenance, renewal, vacancy, repair approval, and open-issue events that should create an owner-facing update.",
      },
      {
        title: "Data captured",
        description: "Property, owner, issue status, renter or resident context, next step, approval need, and sensitive details to exclude.",
      },
      {
        title: "Update automations",
        description: "Drafts, reminders, approval queues, and send rules matched to owner communication policies.",
      },
      {
        title: "System writebacks",
        description: "Sent status, reviewer, timestamp, summary, and next follow-up logged to your CRM, inbox, or property management system.",
      },
      {
        title: "Stop rules",
        description: "Suppression for sensitive updates, active staff conversations, already-sent notices, legal questions, and owner opt-outs.",
      },
      {
        title: "Escalation paths",
        description: "Human review for costs, complaints, delays, approval requests, financial issues, and relationship-sensitive messages.",
      },
    ],
    beforeAfter: {
      before: [
        "Owners ask for updates because status is not proactively communicated.",
        "Staff rewrite the same leasing and maintenance summaries by hand.",
        "Sensitive updates depend on memory instead of a clear review gate.",
      ],
      after: [
        "Repeatable owner updates are drafted from workflow data.",
        "Staff review only the messages that need judgment.",
        "Sent updates and follow-up commitments are logged where the team can see them.",
      ],
    },
    bestFit: [
      "Owners ask the same leasing, maintenance, and renewal status questions repeatedly.",
      "Your team wants proactive updates but still needs review for sensitive topics.",
      "You have reliable workflow data that can support owner-facing summaries.",
    ],
    notFit: [
      "You want automation to handle owner disputes or financial decisions without staff review.",
      "Status data is not available in any consistent system, inbox, or workflow.",
      "Owner communication rules vary so much that no repeatable update path exists.",
    ],
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
    auditFocus:
      "We review maintenance categories, vendor rules, approval thresholds, resident access notes, dispatch channels, and status logging.",
    auditCta: {
      label: "Book my vendor dispatch audit",
      title: "Want vendor handoffs with fewer coordination loops?",
      body: "We will map which requests can dispatch automatically, which need approval, and how vendor status should return to your operating record.",
    },
    installables: [
      {
        title: "Dispatch triggers",
        description: "Qualified maintenance categories, property rules, urgency levels, and approval states that can start vendor routing.",
      },
      {
        title: "Data captured",
        description: "Trade, property, unit, resident access, photos, urgency, owner threshold, preferred vendor, and dispatch notes.",
      },
      {
        title: "Routing automations",
        description: "Vendor selection, message creation, coordinator alerts, reminder timing, and fallback routing for no response.",
      },
      {
        title: "Writebacks",
        description: "Dispatch status, vendor response, delay, approval, completion, and exception summaries logged to the work-order record.",
      },
      {
        title: "Stop rules",
        description: "Automation pauses when approval is required, staff take over, a vendor declines, or resident context changes.",
      },
      {
        title: "Escalation paths",
        description: "Human review for emergencies, high-cost repairs, owner approvals, resident complaints, and vendor exceptions.",
      },
    ],
    beforeAfter: {
      before: [
        "Coordinators manually copy request details into vendor messages.",
        "Approval thresholds are checked late or inconsistently.",
        "Vendor delays require manual reminders and status hunting.",
      ],
      after: [
        "Qualified requests route with the details vendors need to respond.",
        "Approval and emergency rules are checked before dispatch.",
        "Vendor status and exceptions return to the work-order record.",
      ],
    },
    bestFit: [
      "Your maintenance team repeats the same vendor routing steps every day.",
      "Vendors need better context before accepting or scheduling work.",
      "Approval thresholds and exception rules can be defined by property, owner, or trade.",
    ],
    notFit: [
      "You want automation to approve repairs outside your policy.",
      "Vendor lists, rates, and approval thresholds are not documented anywhere.",
      "Your current request intake does not collect enough details to route safely.",
    ],
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
    auditFocus:
      "We choose the first front-desk workflow, then map voice or SMS triggers, captured context, staff handoff rules, CRM writebacks, and monitoring.",
    auditCta: {
      label: "Book my AI front desk audit",
      title: "Want an AI front desk that starts with one useful workflow?",
      body: "We will help pick the first measurable front-desk workflow and define the controls needed before expanding across channels.",
    },
    installables: [
      {
        title: "Channel triggers",
        description: "Voice, SMS, form, inbox, or portal events that begin a leasing, resident, owner, or vendor workflow.",
      },
      {
        title: "Context capture",
        description: "Caller identity, property, intent, urgency, contact details, prior status, and the next step staff need.",
      },
      {
        title: "Front-desk automations",
        description: "Triage, routing, scheduling prompts, intake questions, reminders, and status updates built around your operating rules.",
      },
      {
        title: "System writebacks",
        description: "Summaries, tasks, notes, stage updates, and alerts routed to the CRM or system of record.",
      },
      {
        title: "Stop rules",
        description: "Hand-off guards for staff takeover, opt-outs, sensitive questions, emergencies, and unclear answers.",
      },
      {
        title: "Escalation paths",
        description: "Human review for fair-housing-sensitive questions, complaints, emergencies, owner issues, payments, and approval decisions.",
      },
    ],
    beforeAfter: {
      before: [
        "AI is discussed as a chatbot instead of a measurable operating workflow.",
        "Inbound calls and messages scatter across staff, inboxes, and CRM notes.",
        "Teams worry automation will create risk or duplicate work.",
      ],
      after: [
        "The first AI front-desk workflow has a trigger, owner, record, and exception path.",
        "Staff receive clean context instead of starting from scratch.",
        "Expansion happens after the first workflow is measured and tuned.",
      ],
    },
    bestFit: [
      "You want AI across front-desk communication but need a controlled first rollout.",
      "Your team has repeatable leasing, resident, owner, or vendor requests.",
      "You need human gates for sensitive questions and system-of-record updates.",
    ],
    notFit: [
      "You want an unsupervised chatbot to answer every property question.",
      "Your team is not ready to pick a first workflow or define escalation rules.",
      "You need a marketing demo rather than an operating workflow tied to records.",
    ],
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
    relatedPosts: ["ai-front-desk-loop-not-chatbot", "property-management-ai-automation-vs-chatbots"],
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
          target: `${siteUrl}${auditHref(service.slug, "service")}`,
          name: service.auditCta.label,
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
