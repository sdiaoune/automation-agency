export type HomepageFaq = {
  question: string;
  answer: string;
  cta?: {
    label: string;
    href: string;
  };
};

export const homepageBuyerFaqs: HomepageFaq[] = [
  {
    question: "Will EMC2Ops answer my calls live or text callers after a missed call?",
    answer:
      "Either option can be configured. With AI voice, the system can answer inbound calls live and follow an approved intake path. With missed-call text-back, your phone or telephony provider triggers a branded SMS after an unanswered call so the conversation can continue by message. In either channel, EMC2Ops can qualify the request, route the next step, and log the summary, status, and owner in your configured CRM workflow. We recommend the smallest channel change that can solve the gap and measure the result.",
    cta: {
      label: "See the missed-call workflow",
      href: "/services/missed-call-recovery/",
    },
  },
  {
    question: "How quickly can we launch—and how much work will my team do?",
    answer:
      "There is no one-size-fits-all launch date; EMC2Ops confirms the window after reviewing the workflow, phone setup, integration access, and approval requirements. Your team provides the current call path, approved messaging, qualification rules, CRM fields, escalation contacts, and one workflow owner. We handle mapping, configuration, integration, testing, reporting setup, and launch monitoring. To reduce risk, the first release can be limited to one property, number, or request type, tested against edge cases, and expanded only after the routing and system writebacks are stable.",
    cta: {
      label: "Review the rollout approach",
      href: "/blog/property-management-ai-implementation-timeline/",
    },
  },
  {
    question: "What happens after the first reply?",
    answer:
      "The reply enters a controlled workflow—not an open-ended chatbot conversation. EMC2Ops can match the renter to the right property or lead record, collect approved details such as move date, budget, pets, property fit, and tour intent, answer approved questions, then book or route the next step. The workflow can write the summary, transcript link when supported, status, owner, and next action to your CRM. Opt-outs, sensitive questions, uncertain answers, duplicate records, and staff takeover trigger stop or escalation rules instead of more automated messages.",
    cta: {
      label: "See the lead-to-lease path",
      href: "/use-cases/lead-to-lease-automation/",
    },
  },
  {
    question: "Which property types and portfolio sizes are the best fit?",
    answer:
      "Fit depends more on workflow repetition than door count. EMC2Ops is strongest for property managers, multifamily teams, and rental operators with recurring leasing or resident inquiries, missed calls during busy periods, manual follow-up, inconsistent CRM records, and clear owners for exceptions. That can be a smaller team proving one workflow or a larger operation standardizing routing across properties. It is usually not a good first fit when volume is too low to measure, property information has no reliable source, or nobody can own escalations. We assess those conditions before recommending a build.",
    cta: {
      label: "Find your best first workflow",
      href: "/book-demo/",
    },
  },
  {
    question: "How is the AI customized for each property and brand?",
    answer:
      "EMC2Ops customizes the workflow within approved, testable boundaries. Brand-level rules can set the greeting, tone, qualification standards, and handoff experience, while property-level fields can cover office hours, amenities, approved FAQs, routing contacts, CRM fields, and escalation paths. Your team approves the source material, conversation logic, and acceptance tests before launch. Customization does not give the AI permission to invent availability, pricing, policy, legal interpretations, or exceptions; when a reliable answer is not available, the workflow routes the question to a person.",
    cta: {
      label: "Compare custom and off-the-shelf AI",
      href: "/compare/custom-automation-vs-off-the-shelf-property-management-ai/",
    },
  },
  {
    question: "Who handles exceptions after hours?",
    answer:
      "Your designated on-call or next-business-day team handles situations that require human judgment or action; EMC2Ops handles the approved intake and routing around that process. The workflow can collect essential details, classify the message using your definitions, notify the correct destination, create a record, and stop automation when the issue is urgent, sensitive, or uncertain. You decide what can wait, what should escalate, and what callers are told if nobody is immediately available. Automated 24/7 intake is not the same as staffed 24/7 resolution, and it does not replace emergency services.",
    cta: {
      label: "Map an after-hours workflow",
      href: "/blog/after-hours-leasing-automation/",
    },
  },
  {
    question: "Why choose EMC2Ops instead of EliseAI, a chatbot, a call center, or PMS-native AI?",
    answer:
      "Choose based on the operating gap. EliseAI and PMS-native assistants can be strong choices for broad, standardized workflows inside their supported platforms. Call centers provide live human coverage, while basic chatbots mainly answer questions. EMC2Ops is a services-led implementation partner for teams that need one controlled workflow mapped, connected, tested, and measured across their existing phone, SMS, CRM or PMS, calendar, and routing rules. It can coexist with tools you already own. If a native feature already solves the workflow end to end, we would rather identify that than add another unnecessary system.",
    cta: {
      label: "Compare the buying options",
      href: "/compare/",
    },
  },
  {
    question: "Which languages are supported?",
    answer:
      "English is the default implementation language. Support for Spanish or another language is evaluated for the specific voice or SMS channel, AI model, telephony provider, approved content, and workflow you plan to use. Model availability alone is not treated as production readiness: the actual conversation path must be tested, policy content must have an approved source in that language, and ambiguous or sensitive cases need a defined human fallback. We confirm the production-tested language scope before launch instead of promising a blanket language count.",
    cta: {
      label: "Ask about a specific language",
      href: "/book-demo/",
    },
  },
  {
    question: "How does pricing work?",
    answer:
      "EMC2Ops pricing is quote-based and tied to the workflow being deployed. Cost depends on the CRM or property-management system, call and message volume, channels, workflow count, integration access, phone or SMS configuration, reporting, compliance requirements, and the level of ongoing monitoring or optimization. Before implementation begins, you receive a written scope showing what is included, the assumptions and exclusions affecting cost, and how additional properties, channels, or workflows would change the engagement. Starting with one measurable workflow keeps the initial commitment and expansion decision grounded in actual operating data.",
    cta: {
      label: "Get a scoped quote",
      href: "/book-demo/",
    },
  },
];

export const homepageSetupFaqs: HomepageFaq[] = [
  {
    question: "Does this replace my team?",
    answer:
      "No. EMC2Ops handles approved, repeatable intake, qualification, routing, reminders, and logging. Your team keeps ownership of judgment calls, sensitive conversations, approvals, negotiations, emergencies, and any exception that falls outside the tested workflow.",
  },
  {
    question: "Can it connect to my CRM or property-management system?",
    answer:
      "Often, but the connection path depends on the system and the access available to your account. EMC2Ops can use supported APIs, native connectors, middleware such as Zapier, Make, or n8n, webhooks, inbox or form parsing, review queues, or a hybrid approach. We confirm the fields, permissions, writebacks, and fallback behavior during scoping.",
  },
  {
    question: "What about SMS compliance?",
    answer:
      "We design consent language, opt-out handling, message flows, quiet-hour behavior, and routing around the requirements of your use case and provider. Your business remains responsible for legal approval, carrier registration, and the accuracy of its policies; EMC2Ops does not present workflow configuration as legal or carrier compliance approval.",
  },
  {
    question: "Can it handle maintenance requests?",
    answer:
      "It can handle controlled maintenance intake: collect the issue, urgency, property or unit, access details, and photos or links when the channel supports them, then route the record into your staff or vendor process. It does not diagnose repairs, promise dispatch, or replace your emergency-response policy.",
  },
];

export const homepageFaqs = [...homepageBuyerFaqs, ...homepageSetupFaqs];
