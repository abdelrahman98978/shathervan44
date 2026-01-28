import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Truck } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  created_at: string;
  tracking_number: string | null;
}

export default function MyOrdersPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        navigate('/admin/login');
      } else {
        fetchOrders();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.id]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total_amount, created_at, tracking_number')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('orders.status.pending')}</Badge>;
      case 'processing':
        return <Badge variant="secondary">{t('orders.status.processing')}</Badge>;
      case 'shipped':
        return <Badge>{t('orders.status.shipped')}</Badge>;
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">{t('orders.status.delivered')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('orders.status.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusLabel = (status: string | null) => {
    switch (status) {
      case 'paid':
        return t('orders.payment.paid');
      case 'pending':
        return t('orders.payment.pending');
      case 'failed':
        return t('orders.payment.failed');
      default:
        return '-';
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
            <Link to="/" className="hover:text-foreground transition-colors">{t('breadcrumb.home')}</Link>
            <span className="mx-1">/</span>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">{t('breadcrumb.dashboard')}</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">{t('orders.title')}</span>
          </nav>
        </div>
      </div>

      <div className="container-rtl py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('orders.empty')}</h2>
            <p className="text-muted-foreground mb-4">{t('orders.emptyDesc')}</p>
            <Button asChild>
              <Link to="/products">{t('orders.browseProducts')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {t('orders.orderNumber')}: <span className="font-mono" dir="ltr">{order.order_number}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-muted-foreground">
                      {t('orders.paymentStatus')}: {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t('cart.total')}</p>
                      <p className="text-xl font-bold">{formatNumber(order.total_amount)} {t('common.currency')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.tracking_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>{t('orders.trackingNumber')}: </span>
                          <span className="font-mono" dir="ltr">{order.tracking_number}</span>
                        </div>
                      )}
                      <Separator orientation="vertical" className="hidden md:block h-10" />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/my-orders/${order.id}`}>
                            {t('orders.viewDetails')}
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/order-tracking/${order.id}`}>
                            {t('orders.trackOrder')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
