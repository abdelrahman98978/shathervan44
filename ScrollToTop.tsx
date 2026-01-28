import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-40 left-4 z-[60] flex items-center justify-center",
        "w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "backdrop-blur-sm border border-primary-foreground/20",
        "hover:scale-110 active:scale-95",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="العودة للأعلى"
    >
      <ChevronUp className="h-5 w-5 xs:h-6 xs:w-6" />
    </button>
  );
}
