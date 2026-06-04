// app/contact/page.tsx
import { getPageMetadata } from '@/lib/database/db'; // Double check your import path here!
import ContactClient from './ContactClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  return await getPageMetadata('/contact');
}

// 2. Render the interactive Client Component
export default function ContactPage() {
  return <ContactClient />;
}