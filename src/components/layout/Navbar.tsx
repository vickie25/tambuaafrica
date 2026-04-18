import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, User, LogIn, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Safaris", path: "/safaris", dropdown: [
    { label: "Kenya Safaris", path: "/safaris/kenya" },
  ]},
  { label: "Destination", path: "/destinations" },
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary ${
        isScrolled ? "shadow-lg border-b-2 border-primary/20" : ""
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg transition-all duration-300">
              <img 
                src="/tambua-logo.png" 
                alt="Tambua Africa" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-base sm:text-lg md:text-xl text-white">
              Tambua Africa Tours & Safaris
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navLinks.map((link) => (
              <div key={link.path} className="relative">
                {link.dropdown ? (
                  <button
                    onMouseEnter={() => setOpenDropdown(link.path)}
                    onClick={() => setOpenDropdown(openDropdown === link.path ? null : link.path)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-border py-1 animate-in fade-in slide-in-from-top-2 duration-200"
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
          <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold border-none hidden sm:flex"
                  >
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                <Button
                  asChild
                  className={"bg-transparent text-white hover:bg-white/10 font-semibold border-2 border-white"}
                >
                  <Link to="/dashboard">My Bookings</Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="icon"
                  className={"bg-white/10 text-white hover:bg-white/20 border border-white/30"}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white/10 text-white"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
