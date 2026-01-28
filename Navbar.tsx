import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/CartIcon";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logoMazen from "@/assets/logo-mazen.png";

const getNavLinks = (t: (key: string) => string) => [
  { name: t('nav.home'), path: "/" },
  { name: t('nav.products'), path: "/products" },
  { name: t('nav.services'), path: "/services" },
  { name: t('nav.calculator'), path: "/solar-calculator" },
  { name: t('nav.projects'), path: "/projects" },
  { name: t('nav.blog'), path: "/blog" },
  { name: t('nav.contact'), path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navLinks = getNavLinks(t);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Dynamic text color based on scroll state and theme
  const getTextClass = (isActive: boolean) => {
    if (isActive) {
      return "bg-accent text-accent-foreground";
    }
    if (scrolled) {
      return "text-foreground hover:text-foreground hover:bg-muted";
    }
    // When not scrolled (on hero), use hero text color for visibility
    return "text-hero hover:text-hero/80 hover:bg-hero/10";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-md py-2"
          : "bg-gradient-to-b from-black/40 to-transparent py-4"
      }`}
    >
      <div className="container-rtl">
        <div className="flex items-center justify-between">
          {/* Logo - Responsive */}
          <Link to="/" className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl overflow-hidden bg-background/10 border border-white/10 shadow-glow group-hover:scale-105 transition-transform">
              <img
                src={logoMazen}
                alt="شعار مازن الزبير"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden xs:block">
              <h1 className={`font-bold text-sm xs:text-base sm:text-lg ${scrolled ? "text-foreground" : "text-hero"}`}>مازن الزبير</h1>
              <p className={`text-[10px] xs:text-xs ${scrolled ? "text-muted-foreground" : "text-hero-muted"}`}>
                Mazen Alzubair Solar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover-scale ${getTextClass(location.pathname === link.path)}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions - Responsive */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
            <CartIcon scrolled={scrolled} />
            <NotificationBell scrolled={scrolled} />
            <LanguageSwitcher scrolled={scrolled} />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-full h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 ${!scrolled ? 'text-hero hover:bg-hero/10 hover:text-hero' : ''}`}
            >
              {isDark ? <Sun className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5" />}
            </Button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className={!scrolled ? 'text-hero hover:bg-hero/10 hover:text-hero' : ''}
                >
                  <Link to="/dashboard" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.name?.split(' ')[0]}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className={!scrolled ? 'text-hero hover:bg-hero/10 hover:text-hero' : ''}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="accent" 
                size="sm" 
                className="hidden sm:flex gap-2 shadow-glow"
                asChild
              >
                <Link to="/admin/login" className="hover-scale">
                  <User className="h-4 w-4" />
                  {t('auth.login')}
                </Link>
              </Button>
            )}
 
            <Button variant="accent" className="hidden md:flex shadow-glow hover-scale" asChild>
              <Link to="/contact">{language === 'ar' ? 'احصل على عرض' : 'Get Quote'}</Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${!scrolled ? 'text-hero hover:bg-hero/10 hover:text-hero' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 hover-scale ${
                    location.pathname === link.path
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-foreground/80 hover:text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    حسابي
                  </Link>
                  <Button variant="outline" className="mt-2 gap-2 hover-scale" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                  <Button variant="accent" className="mt-2 gap-2 shadow-glow hover-scale" asChild>
                    <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4" />
                      تسجيل الدخول
                    </Link>
                  </Button>
              )}
              
              <Button variant="accent" className="mt-2 hover-scale" asChild>
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  احصل على عرض
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
