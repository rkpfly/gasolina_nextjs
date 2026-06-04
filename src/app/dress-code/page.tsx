// src/app/dress-code/page.tsx
import { getLegalContentBySlug } from '@/lib/fetchLegalContent';
import { getPageMetadata } from '@/lib/database/db'; // Ensure this path matches your setup!
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
  // Pass the exact slug for your dress code page
  return await getPageMetadata('/dress-code');
}

// 2. Render the Server Component
export default async function DressCodePage() {
  // Fetch the dress code data
  const doc = await getLegalContentBySlug('dress-code');

  if (!doc) {
    notFound(); 
  }

  return (
    // Increased max-width from 3xl to 6xl to accommodate the side-by-side layout
    <main className="flex flex-col lg:flex-row max-w-6xl mx-auto py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8">

      {/* LEFT COLUMN: A4 Ratio Image */}
      {/* w-full on mobile, fixed width on desktop */}
      {doc.image_url && (
        <div className="w-full lg:w-[350px] xl:w-[500px] flex-shrink-0 mb-6 lg:mb-0 lg:mr-8 xl:mr-12">
        {/* aspect-[21/29.7] creates the perfect A4 ratio */}
            <div className="relative w-full aspect-[21/29.7] rounded-lg md:rounded-xl overflow-hidden shadow-xl bg-gray-100">
                {/* Using standard <img> for external URLs. If using Next/Image, update accordingly */}
                <img
                src={doc.image_url}
                alt={`${doc.label} visual reference`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                />
            </div>
        </div>
      )}

      {/* RIGHT COLUMN: TipTap Content */}
      <div className="w-full flex-1">
        <header className="mb-6 sm:mb-8 md:mb-12 border-b pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {doc.label}
            </h1>
        </header>

        <article
        className="
            w-full
            prose
            prose-sm
            sm:prose-base
            md:prose-lg
            prose-slate
            max-w-none
            text-gray-700
            prose-p:leading-6 sm:prose-p:leading-7
            prose-p:my-4 sm:prose-p:my-5
            prose-li:my-1
            prose-h2:mt-6 sm:prose-h2:mt-8
            prose-h2:mb-3 sm:prose-h2:mb-4
            prose-h3:mt-4 sm:prose-h3:mt-6
            prose-h3:mb-2 sm:prose-h3:mb-3
            prose-hr:my-8 sm:prose-hr:my-10
        "
        dangerouslySetInnerHTML={{ __html: preserveEmptyParagraphs(doc.content) }}
        />
      </div>
    </main>
  );
}