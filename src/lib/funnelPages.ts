export type FunnelPage = {
  slug: string;
  keyword: string;
  volume: number;
  eyebrow: string;
  headline: string;
  description: string;
};

export const funnelPages = [
  {
    slug: "property-management-systems",
    keyword: "property management systems",
    volume: 1900,
    eyebrow: "Property management systems, without the operational gaps",
    headline: "A property management system that closes the gaps between calls, tasks, and follow-up.",
    description: "Keep the PMS you already use. EMC2Ops connects missed calls, leasing follow-up, maintenance intake, owner updates, vendor handoffs, and CRM writeback—with human review where it matters.",
  },
  {
    slug: "property-management-application",
    keyword: "property management application",
    volume: 1000,
    eyebrow: "A practical property management application",
    headline: "A property management application built around the work your PMS misses.",
    description: "Turn calls, forms, inboxes, and resident requests into assigned work—then write the result back to the systems your team already trusts.",
  },
  {
    slug: "real-estate-management-application",
    keyword: "real estate management application",
    volume: 1000,
    eyebrow: "Real estate operations, connected",
    headline: "A real estate management application that keeps every handoff moving.",
    description: "Give leasing, maintenance, vendors, accounting, and managers one operational queue for the work that usually disappears between systems.",
  },
  {
    slug: "property-management-crm",
    keyword: "property management CRM",
    volume: 590,
    eyebrow: "A CRM that follows through",
    headline: "A property management CRM that turns every signal into the next action.",
    description: "Capture every lead and resident request, route the next task, keep a person in control, and sync the outcome back to your property records.",
  },
  {
    slug: "crm-property-management",
    keyword: "CRM property management",
    volume: 590,
    eyebrow: "CRM for property management teams",
    headline: "CRM for property management that follows through automatically.",
    description: "Move beyond a passive contact database. EMC2Ops connects the trigger, owner, deadline, approval, and writeback for each high-value workflow.",
  },
  {
    slug: "property-management-platforms",
    keyword: "property management platforms",
    volume: 590,
    eyebrow: "A focused property management platform",
    headline: "A property management platform for the work between systems.",
    description: "Keep your core software. Add an operations layer that catches signals, assigns work, requests approval, and makes the next step visible.",
  },
  {
    slug: "property-management-tools",
    keyword: "property management tools",
    volume: 480,
    eyebrow: "Tools for the workflows that drain your week",
    headline: "Property management tools that give your team hours back.",
    description: "Start with one expensive workflow—missed calls, slow leasing response, maintenance intake, owner reporting, or vendor dispatch—and prove the result before expanding.",
  },
  {
    slug: "real-estate-management-tools",
    keyword: "real estate management tools",
    volume: 480,
    eyebrow: "Less spreadsheet chasing. More visible work.",
    headline: "Real estate management tools that keep operations out of spreadsheets.",
    description: "Bring scattered requests into one queue, apply the rules your team already uses, and make every handoff, approval, and update measurable.",
  },
  {
    slug: "ai-property-management",
    keyword: "AI property management",
    volume: 320,
    eyebrow: "AI property management with operational guardrails",
    headline: "AI property management that works inside your real workflows.",
    description: "Use AI to triage, draft, route, and follow up while your team keeps control of approvals, exceptions, and the resident experience.",
  },
  {
    slug: "ai-for-property-management",
    keyword: "AI for property management",
    volume: 320,
    eyebrow: "Practical AI for property operations",
    headline: "AI for property management—with human approval where it matters.",
    description: "Automate repetitive decisions and handoffs without surrendering control. EMC2Ops keeps people in the loop and your existing property system in place.",
  },
] as const satisfies readonly FunnelPage[];

export function getFunnelPage(slug: string | undefined): FunnelPage | undefined {
  return funnelPages.find((page) => page.slug === slug);
}
