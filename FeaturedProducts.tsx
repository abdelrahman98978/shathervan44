import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductQuickView } from '@/components/ProductQuickView';
import { WishlistButton } from '@/components/WishlistButton';
import { SkeletonCard } from '@/components/PageLoader';
import { 
  ShoppingCart, 
  Eye, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star
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

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { t, language, isRTL } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const isNewProduct = (createdAt?: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-rtl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="h-4 w-4" />
              {t('home.featured')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.featured.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-rtl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            {t('home.featured')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('home.featured.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.featured.subtitle')}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const hasDiscount = product.discount_price && product.discount_price < product.price;
            const discountPercentage = hasDiscount 
              ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100)
              : 0;
            const displayPrice = hasDiscount ? product.discount_price! : product.price;
            const isNew = isNewProduct(product.created_at);
            const productName = language === 'ar' ? product.name_ar : product.name_en;

            return (
              <div
                key={product.id}
                className="group bg-background rounded-xl overflow-hidden border border-border shadow-card hover:shadow-glow transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {isNew && (
                      <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {t('products.new')}
                      </Badge>
                    )}
                    {hasDiscount && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-1">
                        -{discountPercentage}%
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                      onClick={() => handleQuickView(product)}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      {t('products.quickView')}
                    </Button>
                    <Button
                      size="icon"
                      className="bg-accent hover:bg-accent/90 shadow-lg h-9 w-9"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Category */}
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                  
                  {/* Title */}
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 text-sm md:text-base">
                      {productName}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "h-3 w-3",
                          star <= 4 ? "text-warning fill-warning" : "text-muted"
                        )} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground mr-1">(4.0)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-accent">
                      {formatNumber(displayPrice)} {t('common.currency')}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatNumber(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <p className="text-xs text-warning">
                      {language === 'ar' 
                        ? `متبقي ${product.stock_quantity} قطعة فقط!` 
                        : `Only ${product.stock_quantity} items left!`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Button variant="accent" size="lg" asChild className="shadow-glow hover-scale">
            <Link to="/products">
              {t('home.featured.viewAll')}
              <ArrowIcon className="h-5 w-5 mr-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </section>
  );
}
