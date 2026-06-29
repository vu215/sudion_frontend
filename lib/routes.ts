/**
 * Route helpers for consistent URL generation
 * Centralizes routing logic to make future changes easier
 */

/**
 * Generate booking URL with photographer and service
 * New format: /booking/{photographerId}/{serviceSlug}
 */
export function getBookingUrl(photographerId: string | number, serviceSlug: string): string {
  return `/booking/${photographerId}/${encodeURIComponent(serviceSlug)}`;
}

/**
 * Generate booking URL with photographer, service, and dates
 */
export function getBookingUrlWithDates(
  photographerId: string | number, 
  serviceSlug: string, 
  dates?: string[]
): string {
  const baseUrl = getBookingUrl(photographerId, serviceSlug);
  if (dates && dates.length > 0) {
    return `${baseUrl}?dates=${encodeURIComponent(dates.join(","))}`;
  }
  return baseUrl;
}

/**
 * Generate photographer profile URL
 */
export function getPhotographerProfileUrl(photographerId: string | number): string {
  return `/photographer-profile/${photographerId}`;
}

/**
 * Generate service category URL
 */
export function getServiceUrl(serviceSlug: string): string {
  return `/services/${serviceSlug}`;
}

/**
 * Generate photographer list URL filtered by category and location
 */
export function getPhotographerListUrl(categorySlug?: string, location?: string): string {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (location) params.set("location", location);
  
  const queryString = params.toString();
  return queryString ? `/photographer?${queryString}` : "/photographer";
}

/**
 * Generate messages URL with booking code
 */
export function getMessagesUrl(bookingCode?: string): string {
  if (bookingCode) {
    return `/messages?booking=${encodeURIComponent(bookingCode)}`;
  }
  return "/messages";
}

/**
 * Generate review URL with booking code
 */
export function getReviewUrl(bookingCode: string): string {
  return `/review?booking=${encodeURIComponent(bookingCode)}`;
}
