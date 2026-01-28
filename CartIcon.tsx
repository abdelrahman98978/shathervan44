import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartIconProps {
  scrolled?: boolean;
}

export function CartIcon({ scrolled = true }: CartIconProps) {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      asChild 
      className={`relative ${!scrolled ? 'text-hero hover:bg-hero/10 hover:text-hero' : ''}`}
    >
      <Link to="/cart">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
