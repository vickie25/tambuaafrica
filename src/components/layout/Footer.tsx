import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-black text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-wide mx-auto section-padding py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Stay Updated</h3>
              <p className="text-primary-foreground/70 mt-1">Get the latest safari deals and travel tips</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 w-full md:w-72"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                <Send className="w-4 h-4 mr-2" /> Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide mx-auto section-padding py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Tambua Africa Tours & Safaris Ltd.</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Plainsview Road, F21-5, Hazina Estate
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@tambuaafrica.com" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  info@tambuaafrica.com
                </a>
              </div>
              <div className="flex gap-3">
                <a href="https://facebook.com/tambuaafrica" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://twitter.com/tambuaafrica" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://youtube.com/tambuaafrica" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Safari Itineraries */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Safari Itineraries</h4>
            <ul className="space-y-2">
              {[
                "2-Days Mombasa to Amboseli Air Safari",
                "1 Day Snorkeling Wasini Island", 
                "1 Day Shimba Hills",
                "2 Days Masai Mara From Nairobi",
                "4 Days Masai Mara - Lake Nakuru-Amboseli Safari",
                "3 Days Masai Mara Safari",
              ].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/safaris"
                      className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="space-y-2">
                <h5 className="font-medium text-white">Drop a Line</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:info@tambuaafrica.com" className="hover:text-white transition-colors">
                      info@tambuaafrica.com
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-primary-foreground/70">
                    <Phone className="w-4 h-4 mt-1" />
                    <span>Kenya: +254 726 207 900 / +254 792 329 682 / +254 704 548 78</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Phone className="w-4 h-4" />
                    <span>UK: +44 793 997 0489</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Phone className="w-4 h-4 text-accent" />
                    <span>WA: +254 704 548 878</span>
                  </div>
                </div>
              </li>
              <li className="space-y-2">
                <h5 className="font-medium text-white">Email Address</h5>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@tambuaafrica.com" className="hover:text-white transition-colors">
                    info@tambuaafrica.com
                  </a>
                </div>
              </li>
              <li className="space-y-2">
                <h5 className="font-medium text-white">Visit office</h5>
                <div className="flex items-start gap-2 text-sm text-primary-foreground/70">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Plainsview Road, F21-5, Hazina Estate</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Tambua Africa Tours & Safaris. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
