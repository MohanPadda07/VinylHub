export const recommendationSignals = [
  "collection_overlap",
  "wishlist_similarity",
  "review_sentiment",
  "community_activity",
  "favorite_genres",
  "favorite_artists",
  "similar_collectors",
  "rarity_affinity",
] as const;

export type RecommendationSignal = (typeof recommendationSignals)[number];
