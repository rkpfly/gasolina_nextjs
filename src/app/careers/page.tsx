// app/careers/page.tsx
import { getPageMetadata } from '@/lib/database/db'; // Ensure this matches your utility path
import CareersClient from './CareersClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Make sure you create an entry in your SEO Admin Panel with this exact slug!
  return await getPageMetadata('/careers');
}

// 2. Render the interactive Client Component
export default function CareersPage() {
  return <CareersClient />;
}