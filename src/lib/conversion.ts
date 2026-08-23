export const auditHref = (workflow: string, source: string) =>
  `/book-demo/?workflow=${encodeURIComponent(workflow)}&source=${encodeURIComponent(source)}`;
