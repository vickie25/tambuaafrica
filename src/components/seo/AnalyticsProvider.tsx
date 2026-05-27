import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getStoredConsent, initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Loads GA4 / PostHog only after cookie consent; tracks SPA page views.
 */
const AnalyticsProvider = () => {
  const location = useLocation();

  useEffect(() => {
    if (getStoredConsent() === "accepted") initAnalytics();
  }, []);

  useEffect(() => {
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<{ status: string }>).detail?.status;
      if (detail === "accepted") initAnalytics();
    };
    window.addEventListener("cookie-consent", onConsent);
    return () => window.removeEventListener("cookie-consent", onConsent);
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsProvider;
