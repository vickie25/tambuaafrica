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
import { AIAgentChat } from "@/components/chat/AIAgentChat";
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
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.default })));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.default })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.default })));
const Booking = lazy(() => import("./pages/Booking").then(m => ({ default: m.default })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.default })));
const ConnectionDiagnostics = lazy(() => import("./pages/ConnectionDiagnostics").then(m => ({ default: m.default })));

import SuspenseFallback from "@/components/layout/SuspenseFallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 30,         // 30 minutes
      retry: 1,                        // Single retry on failure
      refetchOnWindowFocus: true,      // Refetch when window regains focus
      refetchOnReconnect: true,        // Refetch when reconnected
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  // Activate performance optimizations
  usePerformanceOptimization();

  const seoByRoute: Record<string, { title: string; description: string }> = {
    "/": {
      title: "Tambua Africa Tours & Safaris | Premium African Safaris",
      description: "Expertly crafted safari journeys across East Africa with trusted guides, custom itineraries, and seamless support.",
    },
    "/safaris": {
      title: "Safaris | Tambua Africa Tours & Safaris",
      description: "Browse curated safari packages across Kenya and East Africa, with flexible durations and booking support.",
    },
    "/destinations": {
      title: "Destinations | Tambua Africa Tours & Safaris",
      description: "Explore top East African destinations, lodges, and experiences for your next wildlife and culture adventure.",
    },
    "/blog": {
      title: "Blog | Tambua Africa Tours & Safaris",
      description: "Latest travel stories, safari insights, and regional updates from Tambua Africa.",
    },
    "/contact": {
      title: "Contact Us | Tambua Africa Tours & Safaris",
      description: "Get in touch to plan your East Africa trip. Our team can help with custom itineraries and bookings.",
    },
    "/terms": {
      title: "Terms of Service | Tambua Africa Tours & Safaris",
      description: "Read Tambua Africa booking, cancellation, and refund terms.",
    },
    "/privacy": {
      title: "Privacy Policy | Tambua Africa Tours & Safaris",
      description: "Learn how Tambua Africa collects, uses, and protects your personal information.",
    },
    "/login": {
      title: "Sign In | Tambua Africa Tours & Safaris",
      description: "Sign in to manage your bookings and account securely.",
    },
    "/signup": {
      title: "Create Account | Tambua Africa Tours & Safaris",
      description: "Create your account to manage bookings and access personalized safari planning.",
    },
  };

  const isBlogDetail = location.pathname.startsWith("/blog/");
  const routeSeo = seoByRoute[location.pathname];
  const shouldRenderRouteSeo = !isBlogDetail && !!routeSeo;
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        {shouldRenderRouteSeo && (
          <Helmet>
            <title>{routeSeo.title}</title>
            <meta name="description" content={routeSeo.description} />
            <link rel="canonical" href={`https://www.tambuaafrica.com${location.pathname}`} />
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
            <AIAgentChat />
            <CookieConsent />
            <BackToTop />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
