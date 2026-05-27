import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Safaris", path: "/safaris", dropdown: [
    { label: "Kenya Safaris", path: "/safaris" },
  ]},
  { label: "Destinations", path: "/destinations" },
  {
    label: "Services",
    path: "/services",
    dropdown: [
      { label: "Ticketing (air & road)", path: "/services/ticketing" },
      { label: "Transfers (road & air)", path: "/services/transfers" },
      { label: "Lodge & camp booking", path: "/services/lodges-camps" },
    ],
  },
  { label: "Travel Info", path: "/travel-info", dropdown: [
    { label: "About Us", path: "/about" },
    { label: "Gallery", path: "/gallery" },
  ]},
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdminRoute = location.pathname === "/admin";

  if (isAdminRoute) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-primary shadow-sm">
        <div className="mx-auto grid h-12 max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-white" title="Tambua Africa home">
            <div className="shrink-0 rounded-lg bg-white p-1">
              <img src="/tambua-logo.png" alt="" className="h-7 w-auto object-contain" aria-hidden />
            </div>
            <span className="min-w-0 truncate text-sm font-semibold font-sans">Admin Panel</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 px-3 text-xs text-white hover:bg-white/10">
              <Link to="/" className="inline-flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">View Site</span>
              </Link>
            </Button>
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden h-8 shrink-0 px-3 text-xs text-white hover:bg-white/10 sm:inline-flex">
                  <Link to="/dashboard">Bookings</Link>
                </Button>
                <Button onClick={handleSignOut} size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-white hover:bg-white/10" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 px-3 text-xs text-white hover:bg-white/10">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "top-3 mx-3 lg:mx-auto lg:max-w-[min(1400px,calc(100%-2rem))] rounded-2xl glass-dark shadow-2xl"
            : "top-0 bg-gradient-to-b from-black/50 to-transparent"
        }`}
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? "h-16" : "h-20 sm:h-24"}`}>
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" title="Tambua Africa Tours & Safaris">
              <div className={`rounded-xl bg-white/10 backdrop-blur-sm p-2 transition-all duration-300 border border-white/20 ${isScrolled ? "" : "border-white/10"}`}>
                <img
                  src="/tambua-logo.png"
                  alt="Tambua Africa"
                  className="h-8 w-auto object-contain sm:h-9 lg:h-10"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-display font-bold text-white leading-none text-base lg:text-lg tracking-wide">
                  Tambua Africa
                </span>
                <span className="font-sans text-white/60 text-[10px] uppercase tracking-[0.15em] leading-none mt-0.5 hidden lg:block">
                  Tours & Safaris
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div
              className="hidden lg:flex items-center gap-0.5 xl:gap-1"
              ref={dropdownRef}
            >
              {navLinks.map((link) => (
                <div key={link.path} className="relative">
                  {link.dropdown ? (
                    <button
                      onMouseEnter={() => setOpenDropdown(link.path)}
                      onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                      className={`group flex items-center gap-1 px-3 xl:px-3.5 py-2 rounded-xl text-[13px] xl:text-[13.5px] font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        location.pathname.startsWith(link.path)
                          ? "bg-white/20 text-white"
                          : "text-white/85 hover:bg-white/12 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === link.path ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className={`block px-3 xl:px-3.5 py-2 rounded-xl text-[13px] xl:text-[13.5px] font-sans font-medium tracking-wide transition-all duration-200 whitespace-nowrap ${
                        location.pathname === link.path
                          ? "bg-white/20 text-white"
                          : "text-white/85 hover:bg-white/12 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {link.dropdown && openDropdown === link.path && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[13rem] w-max max-w-[16rem] glass-light rounded-2xl shadow-2xl py-2 border border-white/60 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-5 py-2.5 text-sm font-sans text-foreground hover:bg-primary/8 hover:text-primary transition-colors font-medium"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Book Now CTA */}
              <Button
                asChild
                className="hidden lg:inline-flex btn-pill bg-accent text-white hover:bg-accent/90 px-5 py-2.5 text-[13px] shadow-lg shadow-accent/20 border-0"
              >
                <Link to="/safaris">Book Safari</Link>
              </Button>

              {/* Auth */}
              {!user ? (
                <Button
                  asChild
                  size="icon"
                  className="rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm hidden lg:flex"
                >
                  <Link to="/login" aria-label="Sign in">
                    <User className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <div className="hidden lg:flex items-center gap-1.5">
                  {isAdmin && (
                    <Button
                      asChild
                      className="btn-pill bg-white/15 border border-white/20 text-white hover:bg-white/25 px-4 text-[13px] backdrop-blur-sm"
                    >
                      <Link to="/admin">Admin</Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    className="btn-pill bg-white/10 border border-white/20 text-white hover:bg-white/20 px-4 text-[13px] backdrop-blur-sm"
                  >
                    <Link to="/dashboard" className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      Bookings
                    </Link>
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    size="icon"
                    className="rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden rounded-xl p-2.5 text-white bg-white/10 border border-white/20 backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
        
        {/* Drawer Panel */}
        <div className={`absolute right-0 top-0 bottom-0 w-[min(360px,90vw)] bg-primary shadow-2xl flex flex-col transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <img src="/tambua-logo.png" alt="" className="h-7 w-auto object-contain" aria-hidden />
              </div>
              <span className="font-display font-bold text-white text-lg">Tambua Africa</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <div key={link.path}>
                  {link.dropdown ? (
                    <div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                          location.pathname.startsWith(link.path)
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === link.path ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${openDropdown === link.path ? "max-h-56" : "max-h-0"}`}>
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex pl-8 pr-4 py-2.5 text-sm font-sans text-white/60 hover:text-white transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                        location.pathname === link.path
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drawer Footer CTAs */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <Button asChild className="w-full btn-pill bg-accent text-white hover:bg-accent/90 font-semibold py-6">
              <Link to="/safaris">Book a Safari</Link>
            </Button>
            {!user ? (
              <Button asChild variant="ghost" className="w-full btn-pill border border-white/20 text-white hover:bg-white/10 py-6">
                <Link to="/login" className="inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              </Button>
            ) : (
              <Button onClick={handleSignOut} variant="ghost" className="w-full btn-pill border border-white/20 text-white hover:bg-white/10 py-6">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
