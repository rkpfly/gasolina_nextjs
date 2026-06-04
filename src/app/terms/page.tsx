// src/app/terms-and-conditions/page.tsx
import { getLegalContentBySlug } from '@/lib/fetchLegalContent';
import { getPageMetadata } from '@/lib/database/db'; // ✅ Added SEO import
import { notFound } from 'next/navigation';

/**
 * TipTap uses empty <p></p> tags as spacer/line-break elements.
 * Tailwind's prose plugin collapses these to zero height.
 * Replace them with a non-breaking space so the paragraph
 * retains its natural line height and acts as a visual gap.
 */
function preserveEmptyParagraphs(html: string): string {
  return html.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
}

// Optional: Force this page to be statically generated and revalidated
export const revalidate = 86400; // Revalidate every 24 hours

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Pass the exact slug for your terms and conditions page
  return await getPageMetadata('/terms-and-conditions');
}

// 2. Render the Server Component
export default async function TermsAndConditionsPage() {
  // Hardcode the slug for the Terms and Conditions page (fetching the content from your DB)
  const doc = await getLegalContentBySlug('terms');

  if (!doc) {
    // Triggers the standard Next.js app/not-found.tsx page
    notFound(); 
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 border-b pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          {/* Using doc.label as returned by your SQL query */}
          {doc.label}
        </h1>
      </header>
      
      {/* Render the TipTap HTML string securely.
        The 'prose' class from @tailwindcss/typography will style the raw HTML tags (h1, p, ul, etc.) automatically.
      */}
      <article
        className="
          prose
          prose-slate
          lg:prose-lg
          max-w-none
          text-gray-700
          prose-p:leading-7
          prose-p:my-5
          prose-li:my-1
          prose-h2:mt-12
          prose-h2:mb-5
          prose-h3:mt-8
          prose-h3:mb-3
          prose-hr:my-10
        "
        dangerouslySetInnerHTML={{ __html: preserveEmptyParagraphs(doc.content) }}
      />
    </main>
  );
}