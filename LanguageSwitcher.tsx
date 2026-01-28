import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  scrolled?: boolean;
}

export function LanguageSwitcher({ scrolled = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2 h-8 w-8 xs:h-9 xs:w-auto sm:h-10 rounded-full",
            !scrolled && 'text-hero hover:bg-hero/10 hover:text-hero'
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'العربية' : 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('ar')}
          className={language === 'ar' ? 'bg-accent/10' : ''}
        >
          <span className="ml-2">🇸🇩</span>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent/10' : ''}
        >
          <span className="ml-2">🇬🇧</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
