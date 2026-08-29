import { createHash } from "node:crypto";

import { releaseAuthorizationForStory } from "./customerStoryReleaseAuthorizations.ts";
import type { CustomerStoryReleaseAuthorization } from "./customerStoryReleaseAuthorizations.ts";

export interface CustomerMetric {
  label: string;
  baseline: string;
  result: string;
  definition: string;
}

export interface CustomerStory {
  slug: string;
  title: string;
  clientLabel: string;
  industry: "Property management";
  portfolioContext: string;
  summary: string;
  challenge: readonly string[];
  workflow: readonly string[];
  integrations: readonly string[];
  timeframe: string;
  metrics: readonly CustomerMetric[];
  quote: string;
  quoteAttribution: string;
  methodology: readonly string[];
  limitations: readonly string[];
  approvedAt: string;
  publishedAt: string;
  updatedAt: string;
  evidence: {
    studyId: string;
    calculationSha256: string;
    approvedEvidenceCopySha256: string;
    canonicalStorySha256: string;
  };
}

function requireText(value: string, field: string) {
  if (!value.trim()) throw new Error(`Customer story is missing required field: ${field}`);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function validTimestamp(value: string) {
  return /[zZ]$|[+-]\d\d:\d\d$/.test(value) && Number.isFinite(Date.parse(value));
}

export function customerStoryContentSha256(story: CustomerStory) {
  const payload = { ...story, evidence: { studyId: story.evidence.studyId, calculationSha256: story.evidence.calculationSha256, approvedEvidenceCopySha256: story.evidence.approvedEvidenceCopySha256 } };
  return sha256(stableJson(payload));
}

export function releaseAuthorizationPayloadSha256(authorization: CustomerStoryReleaseAuthorization) {
  const { authorizationPayloadSha256: _excluded, ...payload } = authorization;
  return sha256(stableJson(payload));
}

export function validateCustomerStoryRelease(story: CustomerStory, authorization: CustomerStoryReleaseAuthorization | undefined, now = Date.now()) {
  const hashPattern = /^[a-f0-9]{64}$/i;
  if (!authorization) throw new Error(`Customer story ${story.slug} has no separate release authorization.`);
  if (authorization.publicationAuthorized !== true || authorization.revokedAt !== null) throw new Error(`Customer story ${story.slug} is not authorized for publication.`);
  if (!Number.isFinite(authorization.deploymentReviewScore) || authorization.deploymentReviewScore <= 9 || authorization.deploymentReviewScore > 10) throw new Error(`Customer story ${story.slug} did not clear the finite >9 to 10 deployment-review gate.`);
  for (const [field, value] of [["story.approvedAt", story.approvedAt], ["story.publishedAt", story.publishedAt], ["story.updatedAt", story.updatedAt], ["authorization.authorizedAt", authorization.authorizedAt], ["authorization.expiresAt", authorization.expiresAt]] as const) {
    if (!validTimestamp(value)) throw new Error(`Customer story ${story.slug} has an invalid ${field}.`);
  }
  const approvedAt = Date.parse(story.approvedAt);
  const authorizedAt = Date.parse(authorization.authorizedAt);
  const publishedAt = Date.parse(story.publishedAt);
  const updatedAt = Date.parse(story.updatedAt);
  const expiresAt = Date.parse(authorization.expiresAt);
  if (!(approvedAt <= authorizedAt && authorizedAt <= publishedAt && publishedAt <= updatedAt)) throw new Error(`Customer story ${story.slug} has invalid approval, authorization, publication, or update chronology.`);
  if ([approvedAt, authorizedAt, publishedAt, updatedAt].some((timestamp) => timestamp > now)) throw new Error(`Customer story ${story.slug} approval or publication is not yet effective.`);
  if (expiresAt <= now || expiresAt <= publishedAt) throw new Error(`Customer story ${story.slug} release authorization is expired.`);
  if (authorization.studyId !== story.evidence.studyId || authorization.calculationSha256 !== story.evidence.calculationSha256 || authorization.approvedEvidenceCopySha256 !== story.evidence.approvedEvidenceCopySha256 || authorization.canonicalStorySha256 !== story.evidence.canonicalStorySha256) throw new Error(`Customer story ${story.slug} does not match its release authorization hashes.`);
  const computedCopySha256 = customerStoryContentSha256(story);
  if (story.evidence.canonicalStorySha256 !== computedCopySha256) throw new Error(`Customer story ${story.slug} copy changed after authorization.`);
  for (const field of ["calculationSha256", "approvedEvidenceCopySha256", "canonicalStorySha256", "customerApprovalSha256", "independentReviewSha256", "founderApprovalSha256", "externalAuthenticityArtifactSha256", "deploymentReviewArtifactSha256", "authorizationPayloadSha256"] as const) {
    if (!hashPattern.test(authorization[field])) throw new Error(`Customer story ${story.slug} has an invalid release ${field}.`);
  }
  if (releaseAuthorizationPayloadSha256(authorization) !== authorization.authorizationPayloadSha256) throw new Error(`Customer story ${story.slug} release authorization payload hash is invalid.`);
  return story;
}

export function validateCustomerStory(story: CustomerStory) {
  requireText(story.slug, "slug");
  requireText(story.title, "title");
  requireText(story.clientLabel, "clientLabel");
  requireText(story.portfolioContext, "portfolioContext");
  requireText(story.summary, "summary");
  requireText(story.timeframe, "timeframe");
  requireText(story.quote, "quote");
  requireText(story.quoteAttribution, "quoteAttribution");
  requireText(story.approvedAt, "approvedAt");
  requireText(story.publishedAt, "publishedAt");
  requireText(story.updatedAt, "updatedAt");

  if (story.clientLabel !== "U.S. Property Management Operator") {
    throw new Error(`Unapproved anonymized client label for customer story: ${story.slug}`);
  }
  if (story.challenge.length === 0 || story.workflow.length === 0) {
    throw new Error(`Customer story ${story.slug} needs challenge and workflow details.`);
  }
  if (story.metrics.length === 0) {
    throw new Error(`Customer story ${story.slug} needs at least one verified metric.`);
  }
  if (story.methodology.length === 0 || story.limitations.length === 0) {
    throw new Error(`Customer story ${story.slug} needs methodology and limitations.`);
  }
  for (const [index, metric] of story.metrics.entries()) {
    requireText(metric.label, `metrics[${index}].label`);
    requireText(metric.baseline, `metrics[${index}].baseline`);
    requireText(metric.result, `metrics[${index}].result`);
    requireText(metric.definition, `metrics[${index}].definition`);
  }

  const hashPattern = /^[a-f0-9]{64}$/i;
  requireText(story.evidence.studyId, "evidence.studyId");
  for (const field of ["calculationSha256", "approvedEvidenceCopySha256", "canonicalStorySha256"] as const) {
    if (!hashPattern.test(story.evidence[field])) throw new Error(`Customer story ${story.slug} has an invalid evidence ${field}.`);
  }
  validateCustomerStoryRelease(story, releaseAuthorizationForStory(story.slug));

  return story;
}

// Publishing requires both a story and a separately hash-bound release authorization.
// The validator intentionally makes missing, expired, revoked, mismatched, or <=9 proof fail the build.
export const customerStories = [] as const satisfies readonly CustomerStory[];

customerStories.forEach(validateCustomerStory);

export function customerStoryUrl(story: CustomerStory) {
  return `/customers/${story.slug}/`;
}
