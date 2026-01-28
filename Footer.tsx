import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import logoMazen from "@/assets/logo-mazen.png";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email,
        source: "footer",
      });

      if (error) throw error;

      toast({
        title: t('footer.newsletter.success'),
        description: t('footer.newsletter.successDesc'),
      });
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error", error);
      toast({
        title: t('common.error'),
        description: language === 'ar' ? 'تعذر إتمام الاشتراك، حاول مرة أخرى.' : 'Could not complete subscription. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.services'), path: '/services' },
    { label: t('nav.projects'), path: '/projects' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const serviceLinks = [
    { label: t('services.solar.title'), path: '/services' },
    { label: t('nav.calculator'), path: '/solar-calculator' },
    { label: t('services.surveillance.title'), path: '/services' },
    { label: t('services.industrial.title'), path: '/services' },
    { label: t('services.maintenance.title'), path: '/services' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-rtl py-10 xs:py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xs:gap-10 sm:gap-12">
          {/* Company Info */}
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2.5 xs:gap-3">
              <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl overflow-hidden bg-primary-foreground/10 flex items-center justify-center">
                <img
                  src={logoMazen}
                  alt={language === 'ar' ? 'شعار مازن الزبير' : 'Mazen Alzubair Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-base xs:text-lg">
                  {language === 'ar' ? 'مازن الزبير' : 'Mazen Alzubair Solar'}
                </h3>
                <p className="text-xs xs:text-sm opacity-80">
                  {language === 'ar' ? 'Mazen Alzubair Solar' : 'حلول الطاقة الشمسية'}
                </p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors hover-scale"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors hover-scale"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors hover-scale"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors hover-scale"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">{t('footer.quickLinks')}</h4>
            <nav className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all story-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services + Newsletter */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">{t('footer.services')}</h4>
            <nav className="flex flex-col gap-3">
              {serviceLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all story-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-primary-foreground/10" id="newsletter">
              <h4 className="font-bold text-lg mb-3">{t('footer.newsletter')}</h4>
              <p className="text-sm opacity-80 mb-3">
                {t('footer.newsletter.desc')}
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  required
                  placeholder={t('footer.newsletter.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary-foreground/5 border-primary-foreground/20 placeholder:text-primary-foreground/60"
                  aria-label={t('common.email')}
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isSubmitting}
                  className="whitespace-nowrap shadow-glow"
                >
                  {isSubmitting ? t('footer.newsletter.subscribing') : t('footer.newsletter.subscribe')}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">{t('footer.contact')}</h4>
            <div className="space-y-4">
              <a
                href="mailto:mazenalzubair0@gmail.com"
                className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all story-link"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>mazenalzubair0@gmail.com</span>
              </a>
              <a
                href="tel:+249115136522"
                className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 hover:text-accent transition-all story-link"
              >
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span dir="ltr">+249 115 136 522</span>
              </a>
              <div className="flex items-start gap-3 text-sm opacity-80">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'السودان - الخرطوم' : 'Sudan - Khartoum'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-rtl py-4 xs:py-5 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 xs:gap-4">
            <p className="text-xs xs:text-sm opacity-60 text-center md:text-right">
              © {currentYear} {language === 'ar' ? 'مازن الزبير' : 'Mazen Alzubair Solar'}. {t('footer.rights')}.
            </p>
            <div className="flex flex-wrap justify-center gap-3 xs:gap-4 sm:gap-6">
              <Link to="/admin/login" className="text-xs xs:text-sm opacity-60 hover:opacity-100 transition-opacity story-link">
                {t('footer.adminPanel')}
              </Link>
              <Link to="/privacy-policy" className="text-xs xs:text-sm opacity-60 hover:opacity-100 transition-opacity story-link">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/terms" className="text-xs xs:text-sm opacity-60 hover:opacity-100 transition-opacity story-link">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
