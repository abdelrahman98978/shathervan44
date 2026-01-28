import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Heart, ShoppingCart, Trash2, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  discount_price?: number | null;
  images?: string[] | null;
  stock_quantity: number;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, language, isRTL } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const productIds = wishlist.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, name_en, price, discount_price, images, stock_quantity')
        .in('id', productIds);

      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [wishlist]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  const handleAddAllToCart = () => {
    products.forEach(product => {
      if (product.stock_quantity > 0) {
        addToCart(product.id, 1);
      }
    });
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={language === 'ar' ? 'قائمة المفضلة' : 'Wishlist'}
        description={language === 'ar' ? 'قائمة المنتجات المفضلة لديك' : 'Your favorite products'}
      />

      <div className="min-h-screen bg-background py-8">
        <div className="container-rtl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {language === 'ar' ? 'قائمة المفضلة' : 'Wishlist'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'ar' 
                    ? `${wishlist.length} منتج في القائمة`
                    : `${wishlist.length} items in wishlist`}
                </p>
              </div>
            </div>

            {wishlist.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearWishlist}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                </Button>
                <Button 
                  variant="accent" 
                  onClick={handleAddAllToCart}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {language === 'ar' ? 'إضافة الكل للسلة' : 'Add All to Cart'}
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {wishlist.length === 0 ? (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {language === 'ar' 
                    ? 'لم تقم بإضافة أي منتجات للمفضلة بعد. تصفح منتجاتنا وأضف ما يعجبك!'
                    : "You haven't added any products to your wishlist yet. Browse our products and add what you like!"}
                </p>
                <Button asChild variant="accent" size="lg">
                  <Link to="/products" className="gap-2">
                    <Package className="h-5 w-5" />
                    {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                    <ArrowIcon className="h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const hasDiscount = product.discount_price && product.discount_price < product.price;
                const displayPrice = hasDiscount ? product.discount_price! : product.price;
                const productName = language === 'ar' ? product.name_ar : product.name_en;
                const isOutOfStock = product.stock_quantity <= 0;

                return (
                  <Card 
                    key={product.id} 
                    className={cn(
                      "group overflow-hidden transition-all duration-300 hover:shadow-glow",
                      isOutOfStock && "opacity-60"
                    )}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 left-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-destructive hover:bg-background transition-all"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>

                      {/* Out of Stock Badge */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium">
                            {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Product Name */}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                          {productName}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-accent">
                          {formatNumber(displayPrice)} {t('common.currency')}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatNumber(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Continue Shopping */}
          {wishlist.length > 0 && (
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/products" className="gap-2">
                  {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                  <ArrowIcon className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
