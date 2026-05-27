/**
 * Consent-gated analytics (GA4) + Core Web Vitals + optional PostHog.
 */

import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";

export type ConsentStatus = "accepted" | "declined" | null;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function getStoredConsent(): ConsentStatus {
  const v = localStorage.getItem("cookie-consent");
  if (v === "accepted" || v === "declined") return v;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === "accepted";
}

let gaInitialized = false;
let vitalsBound = false;

function sendToGa(metric: Metric) {
  if (!window.gtag) return;
  window.gtag("event", metric.name, {
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    event_category: "Web Vitals",
    event_label: metric.id,
    non_interaction: true,
  });
}

export function bindWebVitals() {
  if (vitalsBound || typeof window === "undefined") return;
  vitalsBound = true;
  onLCP(sendToGa);
  onINP(sendToGa);
  onCLS(sendToGa);
}

function loadGa4() {
  if (!GA_ID || gaInitialized || typeof window === "undefined") return;
  gaInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  bindWebVitals();
}

function loadPostHog() {
  if (!POSTHOG_KEY || typeof window === "undefined") return;
  const script = document.createElement("script");
  script.async = true;
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){
    (e._i.push([i,s,a]),(o=t.createElement("script")).async=1,o.src=s.api_host+"/static/array.js",
    (n=t.getElementsByTagName("script")[0]).parentNode.insertBefore(o,n))})(document,window.posthog||[]);
    posthog.init('${POSTHOG_KEY}',{api_host:'${POSTHOG_HOST}',capture_pageview:false});
  `;
  document.head.appendChild(script);
}

/** Call after user accepts cookies or on load if already accepted. */
export function initAnalytics() {
  if (!hasAnalyticsConsent()) return;
  loadGa4();
  loadPostHog();
}

export function trackPageView(path: string, title?: string) {
  if (!hasAnalyticsConsent()) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
  });
  window.posthog?.capture?.("$pageview", { $current_url: path });
}

export function trackConversion(eventName: string, params?: Record<string, string | number>) {
  if (!hasAnalyticsConsent()) return;
  window.gtag?.("event", eventName, params);
  window.posthog?.capture?.(eventName, params);
}

export { GA_ID };
