import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Shield, Loader2, Wand2, KeyRound, Home, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك في لوحة التحكم',
      });
      navigate('/admin');
    } else {
      toast({
        title: 'فشل تسجيل الدخول',
        description: result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      toast({
        title: 'فشل إرسال الرابط',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setMagicLinkSent(true);
      toast({
        title: 'تم إرسال الرابط',
        description: 'تحقق من بريدك الإلكتروني للدخول',
      });
    }
    setIsSubmitting(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });

    if (error) {
      toast({
        title: 'فشل إرسال رابط إعادة التعيين',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setResetLinkSent(true);
      toast({
        title: 'تم إرسال رابط إعادة التعيين',
        description: 'تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور',
      });
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      toast({
        title: 'فشل تسجيل الدخول',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (showResetForm) {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-2"
        asChild
      >
        <Link to="/">
          <Home className="h-4 w-4" />
          الصفحة الرئيسية
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
              <CardDescription>
                أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetLinkSent ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-medium">تم إرسال الرابط!</h3>
                  <p className="text-sm text-muted-foreground">
                    تحقق من بريدك الإلكتروني وانقر على الرابط لإعادة تعيين كلمة المرور
                  </p>
                  <Button variant="outline" onClick={() => { setResetLinkSent(false); setShowResetForm(false); }}>
                    العودة لتسجيل الدخول
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال رابط الاستعادة'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setShowResetForm(false)}
                  >
                    العودة لتسجيل الدخول
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">لوحة تحكم المشرفين</CardTitle>
            <CardDescription>
              سجل دخولك للوصول إلى لوحة التحكم
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              asChild
            >
              <Link to="/">
                العودة للموقع الرئيسي
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              الدخول عبر Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">كلمة المرور</TabsTrigger>
                <TabsTrigger value="magic">رابط سحري</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        required
                        minLength={6}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري التحقق...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-sm text-muted-foreground hover:text-accent"
                    onClick={() => setShowResetForm(true)}
                  >
                    <KeyRound className="h-4 w-4 ml-1" />
                    نسيت كلمة المرور؟
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="magic">
                {magicLinkSent ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                      <Mail className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="font-medium">تم إرسال الرابط!</h3>
                    <p className="text-sm text-muted-foreground">
                      تحقق من بريدك الإلكتروني وانقر على الرابط للدخول
                    </p>
                    <Button variant="outline" onClick={() => setMagicLinkSent(false)}>
                      إعادة الإرسال
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLink} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="admin@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pr-10"
                          required
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          إرسال رابط الدخول
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-primary-foreground/70">
          © 2024 أعمال مازن الزبير للطاقة الشمسية - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}