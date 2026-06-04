// app/vip/page.tsx
import { getPageMetadata } from '@/lib/database/db'; 
import VipClient from './VipClient';

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Be sure to create this exact slug in your SEO Admin interface!
  return await getPageMetadata('/vip');
}

// 2. Render the interactive Client Component
export default function VipPage() {
  return <VipClient />;
}