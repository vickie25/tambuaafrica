import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

/**
 * Loads GA4 when VITE_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXXXX).
 * Wire conversion events via gtag('event', 'generate_lead', { ... }) on form submit / tel: clicks.
 */
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;

    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
      window.gtag("config", GA_ID, { send_page_view: false });
    }

    window.gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
};

export default GoogleAnalytics;

/** Fire a GA4 conversion event when analytics is configured. */
export function trackConversion(eventName: string, params?: Record<string, string | number>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export { GA_ID };
