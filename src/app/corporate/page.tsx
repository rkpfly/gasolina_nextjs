// app/corporate/page.tsx
import { getPageMetadata } from '@/lib/database/db'; 
import CorporateClient from './CorporateClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Be sure to create this matching slug in your new SEO Admin interface!
  return await getPageMetadata('/corporate');
}

// 2. Render the interactive Client Component
export default function CorporateEventsPage() {
  return <CorporateClient />;
}