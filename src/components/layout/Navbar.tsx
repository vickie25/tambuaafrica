import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
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
  { label: "Destination", path: "/destinations" },
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
    { label: "Gallery Page", path: "/gallery" },
  ]},
  { label: "Blog", path: "/blog" },
  { label: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isAdminRoute = location.pathname === "/admin";

  if (isAdminRoute) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-primary shadow-sm">
        <div className="mx-auto grid h-11 max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 sm:gap-3 sm:px-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-1.5 text-white sm:gap-2"
            title="Tambua Africa home"
          >
            <div className="shrink-0 rounded-md bg-white p-0.5 sm:p-1">
              <img
                src="/tambua-logo.png"
                alt=""
                className="h-6 w-auto object-contain sm:h-7"
                aria-hidden
              />
            </div>
            <span className="min-w-0 truncate text-sm font-medium">Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs text-white hover:bg-white/10 sm:px-3 sm:text-sm"
            >
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5"
                title="View site"
                aria-label="View site"
              >
                <ExternalLink className="h-4 w-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">View site</span>
              </Link>
            </Button>
            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 shrink-0 px-2 text-xs text-white hover:bg-white/10 sm:inline-flex sm:px-3 sm:text-sm"
                >
                  <Link to="/dashboard">Bookings</Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2 text-xs text-white hover:bg-white/10 sm:text-sm"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary ${
        isScrolled ? "shadow-lg border-b-2 border-primary/20" : ""
      }`}
    >
      <div className="mx-auto w-full min-w-0 max-w-[1600px] px-3 sm:px-6 lg:px-10">
        {/* Below lg only two columns (center nav is not displayed); brand column must shrink */}
        <div className="grid h-16 min-h-16 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:h-20 sm:min-h-20 sm:gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto] 2xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto]">
          <Link to="/" className="flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2" title="Tambua Africa Tours & Safaris">
            <div className="shrink-0 rounded-lg bg-white p-1.5 transition-all duration-300 sm:p-2">
              <img
                src="/tambua-logo.png"
                alt="Tambua Africa"
                className="h-8 w-auto object-contain sm:h-9 sm:h-10 lg:h-11"
              />
            </div>
            <span className="block min-w-0 truncate font-bold text-sm text-white leading-tight sm:text-base lg:text-lg">
              <span className="hidden xl:inline">Tambua Africa Tours & Safaris</span>
              <span className="hidden lg:inline xl:hidden">Tambua Africa Tours</span>
              <span className="lg:hidden">Tambua Africa</span>
            </span>
          </Link>

          <div
            className="mx-4 hidden min-w-0 items-center justify-center gap-0.5 lg:flex xl:gap-1"
            ref={dropdownRef}
          >
            {navLinks.map((link) => (
              <div key={link.path} className="relative">
                {link.dropdown ? (
                  <button
                    onMouseEnter={() => setOpenDropdown(link.path)}
                    onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                    className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-lg text-[13px] xl:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      location.pathname.startsWith(link.path)
                        ? "bg-white/20 text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.path ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    className={`px-2.5 xl:px-3 py-2 rounded-lg text-[13px] xl:text-sm font-medium transition-colors whitespace-nowrap ${
                      location.pathname === link.path
                        ? "bg-white/20 text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
                {/* Dropdown Menu */}
                {link.dropdown && openDropdown === link.path && (
                  <div 
                    className="absolute top-full left-0 mt-1 min-w-[13.5rem] w-max max-w-[16rem] bg-white rounded-lg shadow-lg border border-border py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
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
          <div className="flex shrink-0 items-center justify-self-end gap-1 sm:gap-1.5 xl:gap-2">
            {/* Auth Buttons */}
            {!user ? (
              <Button
                asChild
                size="icon"
                className={"bg-white text-primary hover:bg-white/90"}
              >
                <Link to="/login">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    className="hidden border-none bg-accent px-2.5 font-bold text-accent-foreground hover:bg-accent/90 lg:inline-flex lg:px-3 2xl:px-4"
                    title="Admin dashboard"
                  >
                    <Link to="/admin" className="whitespace-nowrap">
                      <span className="2xl:hidden">Admin</span>
                      <span className="hidden 2xl:inline">Admin Dashboard</span>
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  className="h-9 shrink-0 border-2 border-white bg-transparent px-2 font-semibold text-white hover:bg-white/10 sm:h-10 sm:px-3 xl:px-4"
                >
                  <Link
                    to="/dashboard"
                    title="My bookings"
                    aria-label="My bookings"
                    className="inline-flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="h-4 w-4 sm:hidden" aria-hidden />
                    <span className="hidden max-w-[9rem] truncate sm:inline md:hidden">Bookings</span>
                    <span className="hidden md:inline">My Bookings</span>
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="icon"
                  className="h-9 w-9 shrink-0 border border-white/30 bg-white/10 text-white hover:bg-white/20 sm:h-10 sm:w-10"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="shrink-0 rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white shadow-lg border-t-2 border-primary">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.path}>
                {link.dropdown ? (
                  <div>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname.startsWith(link.path)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.path ? "rotate-180" : ""}`} />
                    </button>
                    {/* Mobile Dropdown */}
                    <div className={`overflow-hidden transition-all duration-200 ${
                      openDropdown === link.path ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block pl-8 pr-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-3 rounded-lg text-sm font-bold bg-accent text-accent-foreground transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <Button onClick={handleSignOut} variant="outline" className="w-full mt-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button asChild className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link to="/safaris">Let's Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
