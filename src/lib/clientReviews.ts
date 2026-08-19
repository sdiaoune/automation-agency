export interface ClientReview {
  client: string;
  location?: string;
  organization?: string;
  rating: 5 | null;
  project: string;
  feedback: string;
  implementation: string;
  endorsements: readonly string[];
}

export const clientReviews: readonly ClientReview[] = [
  {
    client: "Jsons Solutions",
    location: "Toronto, Canada",
    rating: 5,
    project: "AI scheduling and calendar workflow",
    feedback: "Jsons Solutions praised EMC2Ops’ work and said they would work with the company again.",
    implementation:
      "EMC2Ops built an AI scheduling assistant connected to Google Calendar so availability and appointment coordination could happen in one workflow. For a property team, the same pattern can help move leasing inquiries toward booked tours without manual back-and-forth.",
    endorsements: [
      "Collaborative",
      "Committed to Quality",
      "Clear Communicator",
      "Accountable for Outcomes",
    ],
  },
  {
    client: "SlyNerds",
    location: "Los Angeles, California",
    rating: 5,
    project: "AI workflow and systems integration",
    feedback:
      "SlyNerds described EMC2Ops as a strong partner and said they hoped to work with the company again.",
    implementation:
      "EMC2Ops connected Make.com and ChatGPT to automate repeatable business steps and pass information between tools. For property teams, that same approach can reduce manual handoffs between inboxes, forms, CRM or PMS records, and task queues.",
    endorsements: ["Collaborative"],
  },
  {
    client: "Brad",
    organization: "Gunner Property Management",
    rating: null,
    project: "Custom property management application",
    feedback:
      "I highly recommend Soya. He developed a custom property management application for our company and did an excellent job. He took the time to understand what we needed, communicated well throughout the process, and delivered everything within the timeframe he promised. Soya was professional, reliable, and very easy to work with. We are extremely pleased with the finished product and would definitely work with him again.",
    implementation:
      "Soya designed and delivered a custom property management application around Gunner Property Management’s requirements, with clear communication and delivery within the promised timeframe.",
    endorsements: ["Professional", "Reliable", "Clear Communicator", "On-Time Delivery"],
  },
] as const;

export const clientReviewCount = clientReviews.length;
export const ratedClientReviews = clientReviews.filter((review) => review.rating !== null);
export const clientReviewRatingCount = ratedClientReviews.length;
export const clientReviewAverage =
  ratedClientReviews.reduce((total, review) => total + (review.rating ?? 0), 0) /
  clientReviewRatingCount;
