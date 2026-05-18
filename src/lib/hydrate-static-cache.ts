import type { QueryClient } from "@tanstack/react-query";
import { getSiteSnapshot } from "@/lib/site-snapshot";

/** Pre-seed React Query so public pages paint instantly from the build snapshot. */
export function hydrateStaticQueryCache(queryClient: QueryClient): void {
  const snapshot = getSiteSnapshot();
  if (!snapshot) return;

  if (snapshot.safaris.length) queryClient.setQueryData(["safaris"], snapshot.safaris);
  if (snapshot.destinations.length) queryClient.setQueryData(["destinations"], snapshot.destinations);
  if (snapshot.blogs.length) queryClient.setQueryData(["blogs", "published"], snapshot.blogs);
  if (snapshot.carousel_images.length) {
    queryClient.setQueryData(["carousel-images-all"], snapshot.carousel_images);
  }
  if (snapshot.destination_lodges.length) {
    queryClient.setQueryData(["destination-lodges"], snapshot.destination_lodges);
  }
  if (snapshot.lodges_service_cards.length) {
    queryClient.setQueryData(["lodges-service-cards"], snapshot.lodges_service_cards);
  }
  if (snapshot.reviews.length) queryClient.setQueryData(["reviews"], snapshot.reviews);
}
