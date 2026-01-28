import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface DeliveryCountdownProps {
  estimatedDelivery: string | null;
  orderStatus: string;
  createdAt: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  isOverdue: boolean;
  totalHoursRemaining: number;
}

export function DeliveryCountdown({ estimatedDelivery, orderStatus, createdAt }: DeliveryCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!estimatedDelivery || orderStatus === 'delivered' || orderStatus === 'cancelled') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const delivery = new Date(estimatedDelivery);
      const diff = delivery.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const totalHoursRemaining = diff / (1000 * 60 * 60);

      setTimeRemaining({
        days: Math.abs(days),
        hours: Math.abs(hours),
        minutes: Math.abs(minutes),
        isOverdue: diff < 0,
        totalHoursRemaining,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedDelivery, orderStatus]);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!estimatedDelivery || !timeRemaining) return 0;
    
    const created = new Date(createdAt).getTime();
    const delivery = new Date(estimatedDelivery).getTime();
    const now = Date.now();
    
    const totalDuration = delivery - created;
    const elapsed = now - created;
    
    const percentage = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Get smart message based on time remaining
  const getDeliveryMessage = () => {
    if (!timeRemaining) return null;

    if (timeRemaining.isOverdue) {
      return {
        text: 'متأخر عن الموعد المتوقع',
        variant: 'destructive' as const,
        icon: AlertCircle,
      };
    }

    if (timeRemaining.days === 0 && timeRemaining.hours < 6) {
      return {
        text: 'متوقع الوصول قريباً!',
        variant: 'default' as const,
        icon: Truck,
      };
    }

    if (timeRemaining.days === 0) {
      return {
        text: 'متوقع الوصول اليوم',
        variant: 'default' as const,
        icon: Truck,
      };
    }

    if (timeRemaining.days === 1) {
      return {
        text: 'متوقع الوصول غداً',
        variant: 'secondary' as const,
        icon: Clock,
      };
    }

    return {
      text: `متوقع الوصول خلال ${timeRemaining.days} أيام`,
      variant: 'secondary' as const,
      icon: Clock,
    };
  };

  // If delivered, show success message
  if (orderStatus === 'delivered') {
    return (
      <Card className="shadow-card bg-success/5 border-success/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <div>
              <p className="text-lg font-semibold text-success">تم التسليم بنجاح!</p>
              <p className="text-sm text-muted-foreground">
                نشكرك على ثقتك بنا
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If cancelled, don't show countdown
  if (orderStatus === 'cancelled') {
    return null;
  }

  // If no estimated delivery set
  if (!estimatedDelivery || !timeRemaining) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">في انتظار تحديد موعد التسليم</p>
              <p className="text-sm text-muted-foreground">
                سيتم تحديث موعد التسليم المتوقع قريباً
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const message = getDeliveryMessage();
  const progressPercentage = getProgressPercentage();

  return (
    <Card className={`shadow-card ${timeRemaining.isOverdue ? 'bg-destructive/5 border-destructive/20' : 'bg-accent/5 border-accent/20'}`}>
      <CardContent className="p-6">
        {/* Header with badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {message && <message.icon className={`h-5 w-5 ${timeRemaining.isOverdue ? 'text-destructive' : 'text-accent'}`} />}
            <span className="font-semibold">الوقت المتبقي للتسليم</span>
          </div>
          {message && (
            <Badge variant={message.variant}>
              {message.text}
            </Badge>
          )}
        </div>

        {/* Countdown Display */}
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className={`p-4 rounded-lg ${timeRemaining.isOverdue ? 'bg-destructive/10' : 'bg-background'}`}>
            <p className={`text-3xl font-bold ${timeRemaining.isOverdue ? 'text-destructive' : 'text-accent'}`}>
              {timeRemaining.days}
            </p>
            <p className="text-sm text-muted-foreground">يوم</p>
          </div>
          <div className={`p-4 rounded-lg ${timeRemaining.isOverdue ? 'bg-destructive/10' : 'bg-background'}`}>
            <p className={`text-3xl font-bold ${timeRemaining.isOverdue ? 'text-destructive' : 'text-accent'}`}>
              {timeRemaining.hours}
            </p>
            <p className="text-sm text-muted-foreground">ساعة</p>
          </div>
          <div className={`p-4 rounded-lg ${timeRemaining.isOverdue ? 'bg-destructive/10' : 'bg-background'}`}>
            <p className={`text-3xl font-bold ${timeRemaining.isOverdue ? 'text-destructive' : 'text-accent'}`}>
              {timeRemaining.minutes}
            </p>
            <p className="text-sm text-muted-foreground">دقيقة</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>بداية الطلب</span>
            <span>التسليم المتوقع</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${timeRemaining.isOverdue ? '[&>div]:bg-destructive' : ''}`}
          />
        </div>

        {/* Estimated Date */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          التاريخ المتوقع: {new Date(estimatedDelivery).toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
