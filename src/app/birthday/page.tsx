// app/birthday/page.tsx
import { getPageMetadata } from '@/lib/database/db'; // Ensure this path matches your db/seo utility
import BirthdayClient from './BirthdayClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Pass the exact slug for your birthday page
  return await getPageMetadata('/birthday');
}

// 2. Render the interactive Client Component
export default function BirthdayPage() {
  return <BirthdayClient />;
}