import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ShoppingCart, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Package,
  Star,
  Check,
  Truck,
  Shield,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  discount_price?: number | null;
  category: string;
  stock_quantity: number;
  images?: string[] | null;
  specifications?: Record<string, string> | null;
  created_at?: string;
}

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  if (!product) return null;

  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100)
    : 0;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    onOpenChange(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted/30">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={language === 'ar' ? product.name_ar : product.name_en}
                className="w-full h-full object-cover"
              />
              
              {/* Discount Badge */}
              {hasDiscount && (
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                  {t('products.discount')} {discountPercentage}%
                </Badge>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                      currentImageIndex === idx 
                        ? "border-accent ring-2 ring-accent/30" 
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col overflow-y-auto max-h-[80vh]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                {language === 'ar' ? product.name_ar : product.name_en}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? product.name_en : product.name_ar}
              </p>
            </DialogHeader>

            {/* Rating Placeholder */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "h-4 w-4",
                      star <= 4 ? "text-warning fill-warning" : "text-muted"
                    )} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.0) • 12 {t('reviews.totalReviews')}</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">
                  {formatNumber(displayPrice)} {t('common.currency')}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatNumber(product.price)} {t('common.currency')}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-success mt-1">
                  {t('quickView.save')} {formatNumber(product.price - displayPrice)} {t('common.currency')}
                </p>
              )}
            </div>

            {/* Description */}
            {(language === 'ar' ? product.description_ar : product.description_en) && (
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {language === 'ar' ? product.description_ar : product.description_en}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success font-medium">
                    {t('quickView.available')} ({product.stock_quantity} {t('quickView.pieces')})
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm text-destructive font-medium">{t('quickView.notAvailable')}</span>
                </>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-accent" />
                <span>{t('quickView.fastDelivery')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-accent" />
                <span>{t('quickView.qualityGuarantee')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent" />
                <span>{t('quickView.originalProduct')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4 text-accent" />
                <span>{t('quickView.safePackaging')}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">{t('common.quantity')}:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-medium border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button
                size="lg"
                className="flex-1 shadow-glow"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="h-5 w-5 ml-2" />
                {t('products.addToCart')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link to={`/products/${product.id}`}>
                  <Eye className="h-5 w-5 ml-2" />
                  {t('products.details')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
