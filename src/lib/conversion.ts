export interface AuditCta {
  label: string;
  title: string;
  body: string;
}

export interface InstallableItem {
  title: string;
  description: string;
}

export interface BeforeAfter {
  before: string[];
  after: string[];
}

export interface WorkflowExample {
  title: string;
  steps: string[];
}

export interface WorkflowTemplate {
  title: string;
  rows: [string, string, string][];
}

export const auditHref = (workflow: string, source: string) =>
  `/book-demo/?workflow=${encodeURIComponent(workflow)}&source=${encodeURIComponent(source)}`;
