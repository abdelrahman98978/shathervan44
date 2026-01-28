import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Home, 
  Settings, 
  Package, 
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function UserDashboard() {
  const { user, isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) return null;

  const quickActions = [
    { icon: Package, label: 'المنتجات', href: '/products', color: 'bg-blue-500/10 text-blue-500' },
    { icon: Package, label: 'طلباتي', href: '/my-orders', color: 'bg-amber-500/10 text-amber-500' },
    { icon: MessageSquare, label: 'تواصل معنا', href: '/contact', color: 'bg-green-500/10 text-green-500' },
    { icon: Settings, label: 'الخدمات', href: '/services', color: 'bg-purple-500/10 text-purple-500' },
  ];

  const recentActivities = [
    { icon: CheckCircle, text: 'تم تسجيل الدخول بنجاح', time: 'الآن', color: 'text-success' },
    { icon: Clock, text: 'آخر زيارة للموقع', time: 'منذ يوم', color: 'text-muted-foreground' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
                <Shield className="h-5 w-5" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Link>
            )}
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="gradient-hero p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
                  <AvatarFallback className="bg-accent text-accent-foreground text-3xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-right">
                  <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                    مرحباً، {user.name}!
                  </h1>
                  <p className="text-primary-foreground/70 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                  <div className="mt-3">
                    <Badge variant={isAdmin ? "default" : "secondary"} className="gap-1">
                      {isAdmin ? (
                        <>
                          <Shield className="h-3 w-3" />
                          مشرف
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3" />
                          مستخدم
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-accent" />
                  الوصول السريع
                </CardTitle>
                <CardDescription>تصفح أقسام الموقع المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border-border/50">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-3`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium">{action.label}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  النشاط الأخير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                <p className="font-medium" dir="ltr">{user.email}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">نوع الحساب</p>
                <p className="font-medium">{isAdmin ? 'مشرف' : 'مستخدم'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">معرف المستخدم</p>
                <p className="font-mono text-xs truncate" dir="ltr">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}