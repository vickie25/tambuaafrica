import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPinterest } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEAM_CONTACT_EMAILS } from "@/lib/admin-email";
import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";

const SOCIAL_LINKS: Array<
  | { href: string; label: string; Icon: typeof Facebook }
  | { href: string; label: string; icon: "pinterest" }
> = [
  { href: "https://www.facebook.com/Tambuasafaris/", label: "Facebook", Icon: Facebook },
  { href: "https://twitter.com/TambuaAfrica", label: "Twitter", Icon: Twitter },
  { href: "https://www.pinterest.com/tambuaafrica/", label: "Pinterest", icon: "pinterest" },
  { href: "https://www.youtube.com/@tambuaafrica", label: "YouTube", Icon: Youtube },
  { href: "https://www.instagram.com/tambuaafrica/", label: "Instagram", Icon: Instagram },
];

const Footer = () => {
  return (
    <footer className="bg-black text-primary-foreground">
      <div className="border-b border-primary-foreground/10">
        <div className="container-wide mx-auto section-padding py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Stay Updated</h3>
              <p className="text-primary-foreground/70 mt-1 text-base">Get the latest Kenya safari deals and travel tips</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 w-full md:w-72 min-h-11 text-base"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 min-h-11 min-w-11 px-4">
                <Send className="w-4 h-4 mr-2" /> Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide mx-auto section-padding py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Tambua Africa Tours &amp; Safaris</h3>
            <p className="text-primary-foreground/70 text-base leading-relaxed">
              Standard Street, Floor 4, Suite 16, Nairobi, Kenya
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a
                  href="mailto:info@tambuaafrica.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-base min-h-11 inline-flex items-center"
                >
                  info@tambuaafrica.com
                </a>
              </div>
              {TEAM_CONTACT_EMAILS.filter((e) => e !== "info@tambuaafrica.com").map((email) => (
                <div key={email} className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-base min-h-11 inline-flex items-center"
                  >
                    {email}
                  </a>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-11 h-11 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-white hover:text-primary transition-colors"
                  >
                    {"icon" in item && item.icon === "pinterest" ? (
                      <FontAwesomeIcon icon={faPinterest} className="w-4 h-4" />
                    ) : (
                      "Icon" in item && <item.Icon className="w-4 h-4" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

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
                    className="text-primary-foreground/70 hover:text-white transition-colors text-base min-h-11 inline-flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Kenya Safari Packages</h4>
            <ul className="space-y-2">
              {[
                "2-Days Mombasa to Amboseli Air Safari",
                "2 Days Masai Mara From Nairobi",
                "4 Days Masai Mara - Lake Nakuru-Amboseli Safari",
                "3 Days Masai Mara Safari",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/safaris"
                    className="text-primary-foreground/70 hover:text-white transition-colors text-base min-h-11 inline-flex items-center"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3 text-base">
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4 mt-1 shrink-0" />
                <a href="tel:+254726207900" className="hover:text-white transition-colors min-h-11 inline-flex items-center">
                  Kenya: +254 726 207 900
                </a>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4 mt-1 shrink-0" />
                <span>UK: +44 793 997 0489</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4 text-accent mt-1 shrink-0" />
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <span>Standard Street, Floor 4, Suite 16, Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-base text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Tambua Africa Tours & Safaris. All rights reserved.</p>
          <a
            href="https://cresdynamics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground transition-colors min-h-11 inline-flex items-center"
          >
            Built by Cres Dynamics Ltd.
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
