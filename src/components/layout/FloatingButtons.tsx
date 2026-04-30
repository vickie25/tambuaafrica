import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, MessageCircle, Shield } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Left side — Admin button */}
      {isAdmin && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Link
            to="/admin"
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            title="Admin Dashboard"
          >
            <Shield className="w-6 h-6" />
          </Link>
        </motion.div>
      )}

      {/* Right side — Scroll top + WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.a
          href="https://wa.me/254792329682?text=Hello%20Tambua%20Africa!%20I'm%20interested%20in%20a%20safari."
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:bg-[#20BD5A] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Chat on WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="w-7 h-7" />
        </motion.a>
      </div>
    </>
  );
};

export default FloatingButtons;
