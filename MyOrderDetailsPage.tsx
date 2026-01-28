import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name_ar: string;
    name_en: string;
    images: string[] | null;
  } | null;
}

interface ShippingStatus {
  id: string;
  order_id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  discount_amount: number | null;
  tax_amount: number | null;
  shipping_amount: number | null;
  shipping_address: string | null;
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  customers: {
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  order_items: OrderItem[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">قيد المعالجة</Badge>;
    case 'processing':
      return <Badge variant="secondary">جاري التجهيز</Badge>;
    case 'shipped':
      return <Badge>تم الشحن</Badge>;
    case 'delivered':
      return <Badge className="bg-success text-success-foreground">تم التسليم</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">ملغى</Badge>;
    default:
      return <Badge variant="outline">غير معروف</Badge>;
  }
};

const getPaymentStatusLabel = (status: string | null) => {
  switch (status) {
    case 'paid':
      return 'مدفوع';
    case 'pending':
      return 'قيد الدفع';
    case 'failed':
      return 'فشل الدفع';
    default:
      return 'غير محدد';
  }
};

export default function MyOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [shippingHistory, setShippingHistory] = useState<ShippingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        navigate('/admin/login');
      } else if (orderId) {
        fetchOrder(orderId);
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user, orderId]);

  const fetchOrder = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          discount_amount,
          tax_amount,
          shipping_amount,
          shipping_address,
          notes,
          tracking_number,
          created_at,
          customers (
            name,
            email,
            phone
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name_ar,
              name_en,
              images
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setOrder(data as unknown as OrderDetails);

      const { data: history, error: historyError } = await supabase
        .from('order_shipping_status')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching shipping history:', historyError);
      } else {
        setShippingHistory((history || []) as ShippingStatus[]);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrder(null);
      setShippingHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/50 py-4">
          <div className="container-rtl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
              <span className="mx-1">/</span>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">لوحة المستخدم</Link>
              <span className="mx-1">/</span>
              <Link to="/my-orders" className="hover:text-foreground transition-colors">طلباتي</Link>
              <span className="mx-1">/</span>
              <span className="text-foreground">تفاصيل الطلب</span>
            </nav>
          </div>
        </div>
        <div className="container-rtl py-12 flex flex-col items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">لم يتم العثور على الطلب</h1>
          <p className="text-muted-foreground mb-4">تأكد من صحة الرابط أو عُد إلى صفحة طلباتك.</p>
          <Button asChild>
            <Link to="/my-orders">العودة إلى طلباتي</Link>
          </Button>
        </div>
      </div>
    );
  }

  const itemsSubtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);
  const shipping = order.shipping_amount ?? 0;
  const tax = order.tax_amount ?? 0;
  const discount = order.discount_amount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/50 py-4">
        <div className="container-rtl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
            <span className="mx-1">/</span>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">لوحة المستخدم</Link>
            <span className="mx-1">/</span>
            <Link to="/my-orders" className="hover:text-foreground transition-colors">طلباتي</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">الطلب #{order.order_number}</span>
          </nav>
        </div>
      </div>

      <div className="container-rtl py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">تفاصيل الطلب</h1>
            <p className="text-muted-foreground text-sm">
              رقم الطلب: <span className="font-mono" dir="ltr">{order.order_number}</span>
            </p>
            <p className="text-muted-foreground text-sm">
              بتاريخ {new Date(order.created_at).toLocaleString('ar-EG')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(order.status)}
            <span className="text-xs text-muted-foreground">
              حالة الدفع: {getPaymentStatusLabel(order.payment_status)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>عناصر الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
                          {item.products?.images && item.products.images.length > 0 ? (
                            <img
                              src={item.products.images[0]}
                              alt={item.products.name_ar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="font-medium truncate">{item.products?.name_ar || 'منتج محذوف'}</p>
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">
                            {item.products?.name_en}
                          </p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-sm text-muted-foreground">سعر الوحدة</p>
                        <p className="font-medium">{item.unit_price.toLocaleString()} ج.س</p>
                        <Separator className="my-1" />
                        <p className="text-sm text-muted-foreground">الإجمالي</p>
                        <p className="font-bold text-accent">{item.total_price.toLocaleString()} ج.س</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>ملخص الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>مجموع العناصر</span>
                    <span>{itemsSubtotal.toLocaleString()} ج.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الشحن</span>
                    <span>{shipping.toLocaleString()} ج.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الضريبة</span>
                    <span>{tax.toLocaleString()} ج.س</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-destructive">
                      <span>الخصم</span>
                      <span>-{discount.toLocaleString()} ج.س</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-bold text-base">
                    <span>الإجمالي النهائي</span>
                    <span>{order.total_amount.toLocaleString()} ج.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>بيانات العميل والشحن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">الاسم</p>
                  <p className="font-medium">{order.customers?.name || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">رقم الهاتف</p>
                  <p className="font-medium" dir="ltr">{order.customers?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium" dir="ltr">{order.customers?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">عنوان الشحن</p>
                  <p className="font-medium whitespace-pre-wrap">{order.shipping_address || 'لم يتم تحديد عنوان شحن'}</p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="text-muted-foreground">رقم التتبع</p>
                    <p className="font-mono" dir="ltr">{order.tracking_number}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <p className="text-muted-foreground">ملاحظات العميل</p>
                    <p className="font-medium whitespace-pre-wrap">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {shippingHistory.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>تاريخ حالة الشحن</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {shippingHistory.map((status) => (
                    <div key={status.id} className="flex items-start justify-between gap-3 border-b last:border-b-0 pb-3 last:pb-0">
                      <div>
                        <p className="font-medium">{status.status}</p>
                        {status.notes && (
                          <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{status.notes}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(status.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link to={`/order-tracking/${order.id}`}>
                تتبع حالة الشحن
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
