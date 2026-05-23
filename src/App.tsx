import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import FloatingButtons from "@/components/layout/FloatingButtons";
import CookieConsent from "@/components/layout/CookieConsent";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import BackToTop from "@/components/layout/BackToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LazyAIAgentChat from "@/components/chat/LazyAIAgentChat";
import { lazy, Suspense, useEffect } from "react";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";

// Lazy load heavy components with optimized prefetching
const Index = lazy(() => import("./pages/Index").then(m => ({ default: m.default })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.default })));
const Safaris = lazy(() => import("./pages/Safaris").then(m => ({ default: m.default })));
const SafariDetail = lazy(() => import("./pages/SafariDetail").then(m => ({ default: m.default })));
const Destinations = lazy(() => import("./pages/Destinations").then(m => ({ default: m.default })));
const Gallery = lazy(() => import("./pages/Gallery").then(m => ({ default: m.default })));
const TravelInfo = lazy(() => import("./pages/TravelInfo").then(m => ({ default: m.default })));
const Blog = lazy(() => import("./pages/Blog").then(m => ({ default: m.default })));
const BlogDetail = lazy(() => import("./pages/BlogDetail").then(m => ({ default: m.default })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.default })));
const Privacy = lazy(() => import("./pages/Privacy").then(m => ({ default: m.default })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.default })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.default })));
const Signup = lazy(() => import("./pages/Signup").then(m => ({ default: m.default })));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword").then(m => ({ default: m.default })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(m => ({ default: m.default })));
const AuthConfirm = lazy(() => import("./pages/AuthConfirm").then(m => ({ default: m.default })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.default })));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.default })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.default })));
const Booking = lazy(() => import("./pages/Booking").then(m => ({ default: m.default })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.default })));
const ConnectionDiagnostics = lazy(() => import("./pages/ConnectionDiagnostics").then(m => ({ default: m.default })));
const ServicesHub = lazy(() => import("./pages/ServicesHub").then(m => ({ default: m.default })));
const TicketingService = lazy(() => import("./pages/TicketingService").then(m => ({ default: m.default })));
const TransfersService = lazy(() => import("./pages/TransfersService").then(m => ({ default: m.default })));
const LodgesCampsService = lazy(() => import("./pages/LodgesCampsService").then(m => ({ default: m.default })));

import SuspenseFallback from "@/components/layout/SuspenseFallback";
import { hydrateStaticQueryCache } from "@/lib/hydrate-static-cache";
import {
  SEO_BY_ROUTE,
  SITE_ORIGIN,
  absoluteUrl,
  truncateMetaDescription,
  GLOBAL_OG,
  GLOBAL_TWITTER,
  TRAVEL_AGENCY_JSON_LD,
  buildBreadcrumbJsonLd,
  DEFAULT_OG_IMAGE_PATH,
} from "@/lib/seo";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

hydrateStaticQueryCache(queryClient);

const AnimatedRoutes = () => {
  const location = useLocation();
  // Activate performance optimizations
  usePerformanceOptimization();

  const isBlogDetail = location.pathname.startsWith("/blog/");
  const isSafariDetail = location.pathname.startsWith("/safaris/") && location.pathname !== "/safaris";
  const routeSeo = SEO_BY_ROUTE[location.pathname];
  const shouldRenderRouteSeo = !isBlogDetail && !isSafariDetail && !!routeSeo;
  const canonicalUrl = `${SITE_ORIGIN}${location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "")}`;
  const metaDescription = routeSeo ? truncateMetaDescription(routeSeo.description) : "";
  const ogImageUrl = absoluteUrl(routeSeo?.ogImage ?? DEFAULT_OG_IMAGE_PATH);
  const breadcrumbLd = buildBreadcrumbJsonLd(location.pathname);
  const isHome = location.pathname === "/";

  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <Suspense fallback={<SuspenseFallback />}>
        {shouldRenderRouteSeo && routeSeo && (
          <Helmet>
            <title>{routeSeo.title}</title>
            <meta name="description" content={metaDescription} />
            {routeSeo.robots ? <meta name="robots" content={routeSeo.robots} /> : <meta name="robots" content="index, follow" />}
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={GLOBAL_OG.type} />
            <meta property="og:title" content={GLOBAL_OG.title} />
            <meta property="og:description" content={GLOBAL_OG.description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:locale" content={GLOBAL_OG.locale} />

            <meta name="twitter:card" content={GLOBAL_TWITTER.card} />
            <meta name="twitter:site" content={GLOBAL_TWITTER.site} />
            <meta name="twitter:title" content={GLOBAL_TWITTER.title} />
            <meta name="twitter:description" content={GLOBAL_TWITTER.description} />
            <meta name="twitter:image" content={ogImageUrl} />

            {isHome && (
              <script type="application/ld+json">{JSON.stringify(TRAVEL_AGENCY_JSON_LD)}</script>
            )}
            {breadcrumbLd && (
              <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
            )}
          </Helmet>
        )}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/safaris" element={<Safaris />} />
            <Route path="/safaris/:id" element={<SafariDetail />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/travel-info" element={<TravelInfo />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<ServicesHub />} />
            <Route path="/services/ticketing" element={<TicketingService />} />
            <Route path="/services/transfers" element={<TransfersService />} />
            <Route path="/services/lodges-camps" element={<LodgesCampsService />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            
            {/* Security: Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            
            {/* Diagnostics (for debugging) */}
            <Route path="/diagnostics" element={<ConnectionDiagnostics />} />
            
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AnimatedRoutes />
            <FloatingButtons />
            <LazyAIAgentChat />
            <CookieConsent />
            <BackToTop />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
