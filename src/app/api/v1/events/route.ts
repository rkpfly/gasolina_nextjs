// app/api/v1/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TICKETING_BACKEND_URL = process.env.TICKETING_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query params to forward — mirrors your backend's expected req.query shape
    const allowedParams = [
      'page',
      'limit',
      'category',
      'location',
      'country',
      'date',
      'dateFrom',
      'dateTo',
      'priceMin',
      'priceMax',
      'priceRange',
      'search',
      'currency',
      'sortBy',
      'status',
      'upcoming',
      'excludePast',
      'publicOnly',
      'organizerName',
    ];

    const forwardedParams = new URLSearchParams();

    // Set sensible defaults (matching your backend defaults)
    const defaults: Record<string, string> = {
      page: '1',
      limit: '12',
      sortBy: 'basicInfo.date',
      status: 'published',
      upcoming: 'false',
      excludePast: 'true',
      publicOnly: 'false',
    };

    for (const param of allowedParams) {
      const value = searchParams.get(param);
      if (value !== null) {
        forwardedParams.set(param, value);
      } else if (defaults[param] !== undefined) {
        forwardedParams.set(param, defaults[param]);
      }
    }
    forwardedParams.set('organizerName', 'Louder Club');

    const backendUrl = `${TICKETING_BACKEND_URL}/wapi/events?${forwardedParams.toString()}`;

    // Forward the Authorization header if present (for optionalAuth on the backend)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers,
      // Don't cache by default — let the frontend control revalidation
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to fetch events from ticketing server', details: errorBody },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Allow the response to be cached for 60s at the edge if desired
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[/api/v1/events] Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching events' },
      { status: 500 }
    );
  }
}