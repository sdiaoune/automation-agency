export interface CustomerStoryReleaseAuthorization {
  storySlug: string;
  studyId: string;
  calculationSha256: string;
  approvedEvidenceCopySha256: string;
  canonicalStorySha256: string;
  customerApprovalSha256: string;
  independentReviewSha256: string;
  founderApprovalSha256: string;
  externalAuthenticityArtifactSha256: string;
  deploymentReviewArtifactSha256: string;
  deploymentReviewScore: number;
  authorizationPayloadSha256: string;
  authorizedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  publicationAuthorized: true;
}

// A customer story cannot build unless a separate, sanitized release authorization
// is added here after external authenticity verification and a >9 deployment review.
// The private source documents remain outside the tracked/public site tree.
export const customerStoryReleaseAuthorizations: readonly CustomerStoryReleaseAuthorization[] = Object.freeze([]);

export function releaseAuthorizationForStory(slug: string) {
  return customerStoryReleaseAuthorizations.find((authorization) => authorization.storySlug === slug);
}
