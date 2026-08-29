export interface WorkflowProofMetric {
  label: string;
  definition: string;
  evidence: string;
}

export interface WorkflowProof {
  title: string;
  intro: string;
  metrics: WorkflowProofMetric[];
}

export interface WorkflowIntegration {
  label: string;
  description: string;
  href?: string;
}

const proofByPath: Record<string, WorkflowProof> = {
  "/services/missed-call-recovery/": {
    title: "How missed-call recovery is measured",
    intro:
      "The workflow is measured as a sequence from the eligible missed call to a confirmed next step. Sent messages and projected calculator results are not counted as customer outcomes.",
    metrics: [
      {
        label: "First-response time",
        definition:
          "Elapsed time from the eligible missed-call event reaching the connected system to provider acceptance of the first valid response.",
        evidence: "Call event, workflow run, provider acceptance timestamp, and exclusion log.",
      },
      {
        label: "Recovered lead",
        definition:
          "One unique missed leasing inquiry that completes a verified two-way reply or another approved recovery action within the measurement window.",
        evidence: "Missed-call event, unique prospect record, inbound reply or completed action, and CRM timestamps.",
      },
      {
        label: "Qualified lead",
        definition:
          "One unique prospect who supplies the required intake fields and reaches a staff-approved routing state. Sensitive questions remain human-reviewed.",
        evidence: "Approved qualification rules, captured fields, CRM status, and decision or review log.",
      },
      {
        label: "Booked showing",
        definition:
          "A confirmed scheduling record tied to one prospect, property, date, and time. A requested or suggested time does not count.",
        evidence: "Calendar or scheduling record, confirmation state, prospect and property identifiers, and later status changes.",
      },
    ],
  },
  "/services/maintenance-intake-automation/": {
    title: "How maintenance intake is measured",
    intro:
      "The baseline and post-launch window use the same required-field rules. Emergencies, duplicates, tests, unsupported media, and staff-takeover cases remain visible instead of being treated as successful automation.",
    metrics: [
      {
        label: "Intake completeness",
        definition:
          "The share of eligible requests containing every required field before staff must ask for missing information.",
        evidence: "Required-field specification, intake record, missing-field flags, and final work-order record.",
      },
      {
        label: "Photo completion",
        definition:
          "The share of eligible requests that attach the requested supported media to the correct work-order or secure record.",
        evidence: "Media request, upload or secure-link event, request identifier, and destination attachment record.",
      },
      {
        label: "Routing time",
        definition:
          "Elapsed time from a complete request or detected exception to acceptance by the correct staff, vendor, approval, or work-order destination.",
        evidence: "Completion or exception timestamp, workflow log, destination acceptance, and retry or failure record.",
      },
      {
        label: "Exception rate",
        definition:
          "The share of eligible workflow runs requiring human review for emergencies, approvals, unclear identity, missing data, or integration failure.",
        evidence: "Workflow run, exception reason, human-review queue, and resolution state.",
      },
    ],
  },
  "/use-cases/leasing-intake-routing-automation/": {
    title: "How leasing intake and routing are measured",
    intro:
      "Leasing intake should create a trustworthy identity, owner, route reason, and next state. Message volume alone does not prove that a lead was recovered, qualified, or booked.",
    metrics: [
      {
        label: "First-response time",
        definition:
          "Elapsed time from an eligible inquiry reaching the intake layer to provider acceptance of the first valid response.",
        evidence: "Source event, workflow run, provider acceptance timestamp, channel, and exclusions.",
      },
      {
        label: "Duplicate-review rate",
        definition:
          "The share of eligible inquiries routed to human review because identity confidence was not strong enough to merge or update a record safely.",
        evidence: "Identity candidates, confidence decision, review queue, and final merge or create action.",
      },
      {
        label: "Qualified lead",
        definition:
          "One unique prospect who supplies the required intake fields and reaches a documented routing state without an automated screening decision.",
        evidence: "Approved intake rules, captured values, CRM status, route reason, and staff review when required.",
      },
      {
        label: "Booked showing",
        definition:
          "A confirmed calendar or scheduling record tied to one prospect and property. Tour requests and unconfirmed tasks are reported separately.",
        evidence: "Scheduling record, prospect and property identifiers, confirmation state, and later cancellation or attendance state.",
      },
    ],
  },
  "/use-cases/resident-owner-vendor-communication-automation/": {
    title: "How cross-audience communication is measured",
    intro:
      "Resident, owner, vendor, and staff messages share one operating status but remain separate conversations. Delivery volume does not count as proof that coordination improved.",
    metrics: [
      {
        label: "Routing time",
        definition:
          "Elapsed time from a complete status or detected exception to the correct audience-specific message, staff task, vendor path, or owner-review queue.",
        evidence: "Status event, workflow log, destination acceptance, assigned owner, and failure record.",
      },
      {
        label: "Manual messages avoided",
        definition:
          "A conservative comparison of staff-written messages for the same workflow volume before and after launch, excluding rewrites and automation-created work.",
        evidence: "Baseline sample, staff-sent counts, workflow volume, and exception or rewrite records.",
      },
      {
        label: "Exception rate",
        definition:
          "The share of eligible runs requiring human review for emergencies, costs, complaints, legal issues, unclear replies, opt-outs, or system failures.",
        evidence: "Workflow run, exception reason, human-review queue, and resolution state.",
      },
      {
        label: "Unowned replies",
        definition:
          "Inbound resident, owner, or vendor replies that do not receive a named staff owner or approved workflow route within the defined service window.",
        evidence: "Inbound reply, audience identity, assignment event, due time, and final owner or exception state.",
      },
    ],
  },
  "/use-cases/security-deposit-automation/": {
    title: "How security deposit automation is measured",
    intro:
      "A case is not treated as complete until the required evidence, reconciliation, manager approval, disposition artifact, delivery, refund milestone, and writeback states are visible. AI drafts and message volume are not counted as final decisions or outcomes.",
    metrics: [
      {
        label: "Evidence completeness",
        definition:
          "The share of eligible cases with every required ledger, inspection, image, invoice, policy, and resident-detail source present and verified before manager review.",
        evidence: "Evidence requirement set, source identifiers, verification state, missing-item flags, and case version.",
      },
      {
        label: "Manager-ready cycle time",
        definition:
          "Elapsed time from the verified move-out trigger to a reconciled, evidence-complete proposal ready for an authorized manager's review.",
        evidence: "Move-out event, case-open timestamp, evidence events, reconciliation state, exception history, and review-ready timestamp.",
      },
      {
        label: "Exception rate",
        definition:
          "The share of eligible cases blocked for missing forwarding details, evidence gaps, amount mismatches, stale versions, deadline risk, or integration failure.",
        evidence: "Case version, exception reason, human-review queue, resolution owner, and resolution state.",
      },
      {
        label: "Approval rework",
        definition:
          "Proposal versions returned or changed after manager review, reported separately by evidence, policy, liability, amount, or documentation reason.",
        evidence: "Frozen proposal version, reviewer, decision, reason code, revised version, and approval timestamp.",
      },
      {
        label: "Deadline adherence",
        definition:
          "Cases reaching the configured internal review, approved-artifact, delivery, and refund milestones by the operator's documented target dates. This is an operational measure, not a legal-compliance guarantee.",
        evidence: "Approved rule version, source date, target dates, artifact timestamp, delivery state, refund milestone, and exception log.",
      },
    ],
  },
};

export function workflowProofForPath(pathname: string) {
  return proofByPath[pathname];
}

const integrationsByPath: Record<string, WorkflowIntegration[]> = {
  "/services/missed-call-recovery/": [
    {
      label: "Phone and call-routing system",
      description: "Provides the eligible missed-call event, caller number, line or property context, and call timestamp.",
    },
    {
      label: "SMS and scheduling providers",
      description: "Send the approved text-back and expose only the showing inventory the workflow is allowed to offer.",
    },
    {
      label: "AppFolio",
      href: "/integrations/appfolio/",
      description: "Scope guest-card, task, note, or handoff updates through the access available to the property team.",
    },
    {
      label: "Buildium",
      href: "/integrations/buildium/",
      description: "Connect supported leasing records through verified API, middleware, inbox, or review-queue paths.",
    },
    {
      label: "LeadSimple",
      href: "/integrations/leadsimple/",
      description: "Route renter or owner leads, tasks, stages, and summaries when the configured pipeline supports them.",
    },
    {
      label: "Middleware and webhooks",
      description: "Use supported APIs, webhooks, Zapier, Make, n8n, or custom middleware without assuming direct-write access.",
    },
  ],
  "/services/maintenance-intake-automation/": [
    {
      label: "Resident portal, inbox, form, phone, or SMS",
      description: "Starts the request and collects the approved fields, access notes, and media the selected channel supports.",
    },
    {
      label: "AppFolio",
      href: "/integrations/appfolio/",
      description: "Scope work-order, note, task, or review handoffs after confirming the account's supported access path.",
    },
    {
      label: "Buildium",
      href: "/integrations/buildium/",
      description: "Route structured maintenance context through verified API, middleware, inbox, form, or staff-review paths.",
    },
    {
      label: "Work-order and vendor systems",
      description: "Create the dispatch-ready record, preserve media links, and return acceptance, delay, or completion status.",
    },
    {
      label: "Owner approval queue",
      description: "Keeps cost, policy, warranty, and high-risk decisions with the approved human reviewer.",
    },
    {
      label: "Middleware and webhooks",
      description: "Connect events and writebacks through supported APIs, webhooks, Zapier, Make, n8n, or custom logic.",
    },
  ],
  "/use-cases/leasing-intake-routing-automation/": [
    {
      label: "Calls, SMS, forms, email, and ILS alerts",
      description: "Normalize approved lead sources while preserving property, channel, campaign, timestamp, and original message context.",
    },
    {
      label: "AppFolio",
      href: "/integrations/appfolio/",
      description: "Scope guest-card, task, note, and leasing handoffs around verified account permissions and supported access.",
    },
    {
      label: "Buildium",
      href: "/integrations/buildium/",
      description: "Connect supported lead or task paths without promising unavailable direct field updates.",
    },
    {
      label: "LeadSimple",
      href: "/integrations/leadsimple/",
      description: "Use documented stages, ownership, tasks, and stop rules when the client's pipeline and access support them.",
    },
    {
      label: "Calendar and tour scheduling",
      description: "Expose approved availability, confirm the booking, and return cancellation, reschedule, or attendance state.",
    },
    {
      label: "Middleware and webhooks",
      description: "Use supported APIs, webhooks, exports, inbox parsing, Zapier, Make, n8n, or custom middleware.",
    },
  ],
  "/use-cases/resident-owner-vendor-communication-automation/": [
    {
      label: "PMS, CRM, or work-order record",
      description: "Holds the current status, accountable staff owner, permissions, next event, and separate audience histories.",
    },
    {
      label: "AppFolio",
      href: "/integrations/appfolio/",
      description: "Scope supported resident, owner, maintenance, task, or note handoffs after access is verified.",
    },
    {
      label: "Buildium",
      href: "/integrations/buildium/",
      description: "Connect supported communication and work-order paths through the safest available integration route.",
    },
    {
      label: "Resident portal, SMS, and email",
      description: "Keep resident acknowledgements, access questions, updates, opt-outs, and exceptions in role-specific threads.",
    },
    {
      label: "Vendor and owner channels",
      description: "Send approved scope or reviewable status without exposing resident, owner, vendor, or internal-only context to the wrong audience.",
    },
    {
      label: "Middleware, review queues, and webhooks",
      description: "Coordinate status changes with supported APIs, inbox parsing, forms, Zapier, Make, n8n, or custom logic.",
    },
  ],
  "/use-cases/security-deposit-automation/": [
    {
      label: "PMS and move-out source",
      description: "Provides the verified property, unit, resident, move-out, deposit-ledger, and policy context used to open the case.",
    },
    {
      label: "AppFolio",
      href: "/integrations/appfolio/",
      description: "Scope move-out, ledger, attachment, note, or writeback access only after the property's supported permissions are verified.",
    },
    {
      label: "Private evidence storage",
      description: "Preserves inspections, before and after images, invoices, policies, correspondence, source identifiers, and verification states.",
    },
    {
      label: "Accounting and ledger records",
      description: "Reconciles deposit held, credits, proposed deductions, approved refund, and fulfillment status without moving money by default.",
    },
    {
      label: "Rules and deadline controls",
      description: "Applies the operator's versioned, counsel-approved configuration, source dates, internal targets, and manager-review requirements.",
    },
    {
      label: "Delivery, refund, and writeback tracking",
      description: "Records the approved artifact, delivery state, refund milestone, and PMS update through verified APIs, middleware, exports, or review queues.",
    },
  ],
};

export function workflowIntegrationsForPath(pathname: string) {
  return integrationsByPath[pathname] || [];
}
