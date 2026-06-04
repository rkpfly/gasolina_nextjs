// Map your string page slugs to their numeric IDs in the database
export const PAGE_MAP = {
  'home': 1,
  'about': 2,
  'contact': 3,
  'services': 4,
  'pricing': 5,
  'offers': 6,
  'jobs': 7,
  'city': 8,
  'seo': 9,
} as const;

// This creates a union type: 'home' | 'about' | 'contact' | 'services' | 'pricing'
export type PageSlug = keyof typeof PAGE_MAP;

// Optional: Helper to get the ID safely
export function getPageId(slug: string): number | null {
  if (slug in PAGE_MAP) {
    return PAGE_MAP[slug as PageSlug];
  }
  return null;
}