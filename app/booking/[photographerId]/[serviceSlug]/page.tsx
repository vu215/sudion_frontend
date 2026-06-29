/**
 * Dynamic Routing Version of Booking Page
 * New URL format: /booking/{photographerId}/{serviceSlug}
 * Example: /booking/123/wedding
 * 
 * This replaces the old query string format: /booking?photographer=123&service=wedding
 */

"use client";

import { Suspense, use } from "react";
import { redirect, useSearchParams } from "next/navigation";

interface BookingParams {
  photographerId: string;
  serviceSlug: string;
}

function BookingRedirect({ params }: { params: Promise<BookingParams> }) {
  const { photographerId, serviceSlug } = use(params);
  const searchParams = useSearchParams();
  
  // Get additional query params like dates
  const dates = searchParams.get("dates");
  
  // Redirect to the old query-based URL format
  // This maintains backward compatibility while transitioning
  let queryUrl = `/booking?photographer=${photographerId}&service=${serviceSlug}`;
  
  if (dates) {
    queryUrl += `&dates=${encodeURIComponent(dates)}`;
  }
  
  redirect(queryUrl);
  
  return null;
}

export default function DynamicBookingPage({ params }: { params: Promise<BookingParams> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafbfc]" />}>
      <BookingRedirect params={params} />
    </Suspense>
  );
}
