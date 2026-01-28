import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  Loader2
} from 'lucide-react';

export default function CartPage() {
  const { items, isLoading, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-rtl py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
            <p className="text-muted-foreground mb-8">
              {t('cart.emptyDesc')}
            </p>
            <Button asChild size="lg">
              <Link to="/products">{t('nav.products')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container-rtl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">{t('breadcrumb.home')}</Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="text-foreground">{t('cart.title')}</span>
          </nav>
        </div>
      </div>

      <div className="container-rtl py-8">
        <h1 className="text-3xl font-bold mb-8">{t('cart.title')} ({getCartCount()} {t('products.title')})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={language === 'ar' ? item.product.name_ar : item.product.name_en}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.product_id}`}
                        className="font-semibold hover:text-accent transition-colors line-clamp-2"
                      >
                        {language === 'ar' ? item.product?.name_ar : item.product?.name_en || t('products.title')}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === 'ar' ? item.product?.name_en : item.product?.name_ar}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock_quantity || 99)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-left">
                          <p className="font-bold text-accent">
                            {formatNumber((item.product?.discount_price || item.product?.price || 0) * item.quantity)} {t('common.currency')}
                          </p>
                          {item.product?.discount_price && item.product.discount_price < item.product.price && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatNumber(item.product.price * item.quantity)} {t('common.currency')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('cart.coupon')}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline">{t('cart.applyCoupon')}</Button>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>{formatNumber(subtotal)} {t('common.currency')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span>{shipping === 0 ? t('cart.shippingFree') : `${shipping} ${t('common.currency')}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'شحن مجاني للطلبات أكثر من 1000 ج.س' : 'Free shipping for orders over 1000 SDG'}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-accent">{formatNumber(total)} {t('common.currency')}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  {t('cart.checkout')}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">{t('cart.continueShopping')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
