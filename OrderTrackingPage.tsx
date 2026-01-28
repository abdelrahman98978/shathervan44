import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { DeliveryCountdown } from '@/components/DeliveryCountdown';
import { 
  Package, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck,
  MapPin,
  Search
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_address: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  customers: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

interface ShippingStatus {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusSteps = [
  { key: 'pending', label: 'قيد المعالجة', icon: Clock },
  { key: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2 },
  { key: 'preparing', label: 'قيد التجهيز', icon: Package },
  { key: 'shipped', label: 'تم الشحن', icon: Truck },
  { key: 'in_transit', label: 'في الطريق', icon: MapPin },
  { key: 'delivered', label: 'تم التوصيل', icon: PackageCheck },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingHistory, setShippingHistory] = useState<ShippingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    setIsLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          shipping_address,
          tracking_number,
          estimated_delivery,
          created_at,
          customers (
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (orderError) throw orderError;
      setOrder(orderData as Order);

      // Fetch shipping history
      const { data: shippingData, error: shippingError } = await supabase
        .from('order_shipping_status')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });

      if (shippingError) throw shippingError;
      setShippingHistory(shippingData || []);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
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
          shipping_address,
          tracking_number,
          estimated_delivery,
          created_at,
          customers (
            name,
            email,
            phone
          )
        `)
        .or(`order_number.eq.${searchQuery},tracking_number.eq.${searchQuery}`)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setOrder(data as Order);
        // Fetch shipping history
        const { data: shippingData } = await supabase
          .from('order_shipping_status')
          .select('*')
          .eq('order_id', data.id)
          .order('created_at', { ascending: true });
        setShippingHistory(shippingData || []);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'قيد المعالجة' },
      confirmed: { variant: 'default', label: 'تم التأكيد' },
      preparing: { variant: 'default', label: 'قيد التجهيز' },
      shipped: { variant: 'default', label: 'تم الشحن' },
      in_transit: { variant: 'default', label: 'في الطريق' },
      delivered: { variant: 'default', label: 'تم التوصيل' },
      cancelled: { variant: 'destructive', label: 'ملغي' },
    };
    const { variant, label } = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
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
            <span className="text-foreground">تتبع الطلب</span>
          </nav>
        </div>
      </div>

      <div className="container-rtl py-8">
        <h1 className="text-3xl font-bold mb-8">تتبع الطلب</h1>

        {/* Search */}
        {!orderId && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                أدخل رقم الطلب أو رقم التتبع للبحث عن طلبك
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder="رقم الطلب أو رقم التتبع"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="max-w-md"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 ml-2" />
                  بحث
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {order ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Status */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>حالة الطلب</CardTitle>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent>
                  {/* Progress Steps */}
                  <div className="relative">
                    <div className="flex justify-between mb-8">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= getCurrentStep();
                        const isCurrent = index === getCurrentStep();
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? 'bg-accent text-accent-foreground' 
                                : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-accent/30' : ''}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className={`text-xs mt-2 text-center ${
                              isCompleted ? 'text-accent font-medium' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
                      <div 
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Countdown */}
              <DeliveryCountdown 
                estimatedDelivery={order.estimated_delivery}
                orderStatus={order.status}
                createdAt={order.created_at}
              />

              {/* Shipping History */}
              <Card>
                <CardHeader>
                  <CardTitle>سجل الشحن</CardTitle>
                </CardHeader>
                <CardContent>
                  {shippingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {shippingHistory.map((status, index) => (
                        <div key={status.id} className="flex gap-4">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${
                              index === shippingHistory.length - 1 ? 'bg-accent' : 'bg-muted-foreground'
                            }`} />
                            {index < shippingHistory.length - 1 && (
                              <div className="absolute top-3 left-1 w-0.5 h-full bg-muted" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">{status.notes || status.status}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(status.created_at).toLocaleString('ar-EG')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      لا يوجد سجل شحن حتى الآن
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الطلب</p>
                    <p className="font-mono font-medium">{order.order_number}</p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">رقم التتبع</p>
                      <p className="font-mono font-medium">{order.tracking_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">الإجمالي</p>
                    <p className="text-xl font-bold text-accent">
                      {order.total_amount.toLocaleString()} ج.س
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>عنوان الشحن</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{order.shipping_address}</p>
                </CardContent>
              </Card>

              {order.customers && (
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>الاسم:</strong> {order.customers.name}</p>
                    <p><strong>الهاتف:</strong> {order.customers.phone}</p>
                    <p><strong>البريد:</strong> {order.customers.email}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : !orderId && !searchQuery ? null : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">لم يتم العثور على الطلب</h2>
              <p className="text-muted-foreground">
                تأكد من رقم الطلب أو رقم التتبع وحاول مرة أخرى
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
