import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredConsent } from "@/lib/analytics";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getStoredConsent()) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const setConsent = (status: "accepted" | "declined") => {
    localStorage.setItem("cookie-consent", status);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: { status } }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Cookie className="w-8 h-8 text-accent shrink-0" aria-hidden />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground text-sm">Cookies & analytics</h4>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                We use essential cookies and, with your consent, Google Analytics to improve our site. See our{" "}
                <Link to="/privacy" className="text-accent underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => setConsent("declined")} className="rounded-lg text-xs flex-1 sm:flex-none">
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => setConsent("accepted")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg text-xs flex-1 sm:flex-none"
              >
                Accept analytics
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
