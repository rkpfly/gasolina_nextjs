// app/events/page.tsx
import { getPageMetadata } from '@/lib/database/db'; 
import EventsClient from './EventsClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Be sure to create this matching slug in your SEO Admin interface!
  return await getPageMetadata('/events');
}

// 2. Render the interactive Client Component
export default function EventsPage() {
  return <EventsClient />;
}