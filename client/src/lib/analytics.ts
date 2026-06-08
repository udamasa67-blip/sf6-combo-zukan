const GA_MEASUREMENT_ID = "G-VTD9B6SLZQ";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const pageTitle = title ?? (typeof document !== "undefined" ? document.title : "");

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: window.location.origin + path,
    page_path: path,
    send_to: GA_MEASUREMENT_ID,
  });
}
