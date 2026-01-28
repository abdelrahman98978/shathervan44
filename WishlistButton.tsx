import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'overlay' | 'icon';
  className?: string;
}

export function WishlistButton({ productId, variant = 'default', className }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "p-2 rounded-full transition-all duration-300 hover:scale-110",
          isWishlisted 
            ? "text-destructive" 
            : "text-muted-foreground hover:text-destructive",
          className
        )}
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isWishlisted && "fill-current animate-pulse"
          )} 
        />
      </button>
    );
  }

  if (variant === 'overlay') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-3 left-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-background",
          className
        )}
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isWishlisted 
              ? "text-destructive fill-destructive" 
              : "text-muted-foreground hover:text-destructive"
          )} 
        />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "transition-all duration-300 hover:scale-110",
        isWishlisted && "text-destructive",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-all duration-300",
          isWishlisted && "fill-current"
        )} 
      />
    </Button>
  );
}
