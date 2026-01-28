import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percentage = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();
    
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent", className)}>
      <div
        className="h-full bg-gradient-to-r from-accent via-accent-soft to-gold transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
