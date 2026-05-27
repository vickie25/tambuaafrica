import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="bg-primary text-white pt-20 pb-10 border-t-4 border-accent">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <Link to="/" className="inline-block mb-6">
              <div className="flex flex-col">
                <span className="font-display text-3xl font-bold tracking-tight text-white leading-none">TAMBUA</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-accent font-semibold ml-1 mt-1">
                  Africa Tours & Safaris
                </span>
              </div>
            </Link>
            <p className="font-sans text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              Crafting unforgettable safari experiences across East Africa. Let us guide you through the untamed beauty of our homeland with expertise and passion.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                  aria-label="Social link"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-lg mb-6 text-white">Discover</h4>
            <ul className="space-y-4">
              {["Safaris", "Destinations", "Experiences", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <Link 
                    to={`/${link.toLowerCase().replace(" ", "-")}`} 
                    className="font-sans text-sm text-white/60 hover:text-accent transition-colors duration-300 inline-flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-accent" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-lg mb-6 text-white">Contact Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 bg-white/5 p-2 rounded-lg group-hover:bg-accent transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <span className="block font-sans text-xs uppercase tracking-wider text-white/40 mb-1">Office</span>
                  <span className="font-sans text-sm text-white/80 leading-relaxed block">
                    Nairobi, Kenya<br />East Africa
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 bg-white/5 p-2 rounded-lg group-hover:bg-accent transition-colors duration-300">
                  <Phone className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <span className="block font-sans text-xs uppercase tracking-wider text-white/40 mb-1">Phone</span>
                  <a href="tel:+254700000000" className="font-sans text-sm text-white/80 hover:text-accent transition-colors">
                    +254 700 000 000
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 bg-white/5 p-2 rounded-lg group-hover:bg-accent transition-colors duration-300">
                  <Mail className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <span className="block font-sans text-xs uppercase tracking-wider text-white/40 mb-1">Email</span>
                  <a href="mailto:info@tambuaafrica.com" className="font-sans text-sm text-white/80 hover:text-accent transition-colors">
                    info@tambuaafrica.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-lg mb-6 text-white">Newsletter</h4>
            <p className="font-sans text-white/60 text-sm leading-relaxed mb-6">
              Subscribe to receive the latest safari news, travel inspiration, and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
              />
              <Button 
                type="submit" 
                className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full bg-accent hover:bg-accent/90 text-white px-5 shadow-md"
              >
                Subscribe
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-white/40 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Tambua Africa Tours & Safaris. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="font-sans text-white/40 hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-sans text-white/40 hover:text-white text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
