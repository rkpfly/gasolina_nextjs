import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. We are safely on the server, so we can use private environment variables!
    // No NEXT_PUBLIC_ needed here.
    const envUrl = process.env.TICKETING_BACKEND_URL;
    const API_URL = (envUrl && envUrl !== "undefined") 
      ? envUrl 
      : 'https://api.yourticketing.com'; // Fallback

    // 2. Fetch from your ticketing backend
    // Added 'next: { revalidate: 60 }' so Next.js caches this for 60 seconds.
    // This makes your site lightning fast and protects your ticketing DB from spam.
    const res = await fetch(`${API_URL}/wapi/events?limit=4&upcoming=true&publicOnly=true&sortBy=basicInfo.date&organizerName=Dami Club`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error(`Ticketing API responded with status: ${res.status}`);
    }

    const response = await res.json();

    // 3. Perform all the heavy lifting and formatting on the server
    const dynamicSlides = response.data.map((event: any) => {
      const eventName = event.basicInfo?.name || 'Upcoming Event';
      const words = eventName.split(' ');
      let topText = eventName;
      let bottomText = '';
      
      if (words.length > 1) {
        const midPoint = Math.ceil(words.length / 2);
        topText = words.slice(0, midPoint).join(' ');
        bottomText = words.slice(midPoint).join(' ');
      }

      const eventDate = new Date(event.basicInfo?.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();

      let imageUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200"; 
      const rawImage = event.media?.coverImage || event.media?.thumbnailImage;
      
      if (rawImage) {
        imageUrl = rawImage.startsWith('/') 
          ? `${API_URL}${rawImage}` 
          : rawImage;
      }

      return {
        id: event.id || event._id,
        img: imageUrl,
        date: formattedDate,
        title1: topText,
        title2: bottomText,
        link: `/events/${event.seo?.slug || event.id || event._id}` 
      };
    });

    // 4. Return ONLY the perfectly formatted array to the frontend
    return NextResponse.json(dynamicSlides);

  } catch (error) {
    console.error('[GET /api/hero-events] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}