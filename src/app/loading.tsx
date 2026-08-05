// Route-transition loader (shown on navigations AFTER the first visit).
// The first-visit splash is handled by <IntroLoader> in the root layout.
import FaviconLoader from "@/components/FaviconLoader";

export default function Loading() {
  return <FaviconLoader label="Loading" />;
}
