import type { Metadata } from 'next';
import { EqLoader } from '@/components/Loader';

// 1. Update the interface to reflect that params is a Promise
interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ---------------------------------------------------------------------------
// 1. Dynamic SEO Metadata Generation
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  // 2. Await the params before extracting the id
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_TICKETING_BACKEND_URL}/api/v1/events/${eventId}`, {
      cache: 'no-store', 
    });

    if (!res.ok) {
      throw new Error('Failed to fetch event data for SEO');
    }

    const { data: event } = await res.json();

    return {
      title: event?.basicInfo?.name ? `${event.basicInfo.name} | Tickets` : 'Reserve Tickets | Tixmojo',
      description: event?.basicInfo?.description || 'Secure your tickets. Powered by Tixmojo.',
      openGraph: {
        title: event?.basicInfo?.name,
        description: event?.basicInfo?.description,
        images: event?.media?.coverImage ? [
          event.media.coverImage.startsWith('http') 
            ? event.media.coverImage 
            : `${process.env.NEXT_PUBLIC_TICKETING_BACKEND_URL}/${event.media.coverImage}`
        ] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Reserve Tickets | Tixmojo',
      description: 'Secure checkout powered by Tixmojo.',
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Full-Screen Iframe Page
// ---------------------------------------------------------------------------
// 3. Make the default export async
export default async function EventTicketPage({ params }: EventPageProps) {
  // 4. Await the params here as well
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  const iframeSrc = `${process.env.NEXT_PUBLIC_TICKETING_FRONTEND_URL}/events/frame/detail/${eventId}`;

  return (
    <main className="mt-11 sm:mt-16 relative w-screen h-[100dvh] bg-brand-offwhite overflow-hidden">
      
      <div className="absolute inset-0 flex items-center justify-center -z-10 bg-brand-offwhite">
        <div className="flex flex-col items-center gap-3 text-brand-gray">
          <EqLoader tone="black" bars={4} />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
            Loading Checkout
          </span>
        </div>
      </div>

      <iframe
        src={iframeSrc}
        title="Reserve Tickets"
        className="relative z-10 w-full h-full border-0"
        allow="payment"
      />
    </main>
  );
}