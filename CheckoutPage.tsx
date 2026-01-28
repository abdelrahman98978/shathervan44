import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, CreditCard, Banknote, Package } from 'lucide-react';
import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  email: z.string().email('البريد الإلكتروني غير صالح').max(255),
  phone: z.string().min(9, 'رقم الهاتف غير صالح').max(20),
  city: z.string().min(2, 'المدينة مطلوبة').max(100),
  address: z.string().min(10, 'العنوان مطلوب').max(500),
  notes: z.string().max(500).optional(),
});

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart, sessionId } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'السلة فارغة',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          user_id: isAuthenticated && user ? user.id : null,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer.id,
          total_amount: total,
          shipping_amount: shipping,
          payment_method: paymentMethod,
          shipping_address: `${formData.address}, ${formData.city}`,
          notes: formData.notes || null,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.discount_price || item.product?.price || 0,
        total_price: (item.product?.discount_price || item.product?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add initial shipping status
      await supabase
        .from('order_shipping_status')
        .insert({
          order_id: order.id,
          status: 'pending',
          notes: 'تم استلام الطلب',
        });

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'order_confirmation',
            to: formData.email,
            data: {
              name: formData.name,
              order_number: orderNumber,
              total: total.toLocaleString(),
            },
          },
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      // Clear cart
      await clearCart();

      toast({
        title: 'تم إنشاء الطلب بنجاح',
        description: `رقم الطلب: ${orderNumber}`,
      });

      navigate(`/order-tracking/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الطلب',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-rtl py-16 text-center">
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">السلة فارغة</h1>
          <Button asChild>
            <Link to="/products">تصفح المنتجات</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container-rtl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <Link to="/cart" className="hover:text-foreground transition-colors">السلة</Link>
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="text-foreground">إتمام الطلب</span>
          </nav>
        </div>
      </div>

      <div className="container-rtl py-8">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات العميل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك"
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="09XXXXXXXX"
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>عنوان الشحن</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="الخرطوم"
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="الشارع، الحي، المبنى"
                      rows={3}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="أي تعليمات خاصة للتوصيل"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium">الدفع عند الاستلام</p>
                          <p className="text-sm text-muted-foreground">ادفع نقداً عند استلام الطلب</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50 mt-3">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">تحويل بنكي</p>
                          <p className="text-sm text-muted-foreground">سيتم إرسال تفاصيل الحساب بعد الطلب</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                          {item.product?.images?.[0] ? (
                            <img 
                              src={item.product.images[0]} 
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.product?.name_ar}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {(item.product?.discount_price || item.product?.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>{subtotal.toLocaleString()} ج.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الشحن</span>
                      <span>{shipping === 0 ? 'مجاني' : `${shipping} ج.س`}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-accent">{total.toLocaleString()} ج.س</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'تأكيد الطلب'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
