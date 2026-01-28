import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AIChatbot } from "@/components/AIChatbot";
// Public Pages
import { HomePage } from "@/components/pages/HomePage";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { ProductsPage } from "@/components/pages/ProductsPage";
import { ProductDetailsPage } from "@/components/pages/ProductDetailsPage";
import { BlogPage } from "@/components/pages/BlogPage";
import { BlogPostPage } from "@/components/pages/BlogPostPage";
import { NewsletterPage } from "@/components/pages/NewsletterPage";
import { ArticlesSearchPage } from "@/components/pages/ArticlesSearchPage";
import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/components/pages/TermsOfServicePage";
import { SolarCalculatorPage } from "@/components/pages/SolarCalculatorPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";
import WishlistPage from "@/pages/WishlistPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "@/pages/AdminLogin";
import UserDashboard from "@/pages/UserDashboard";
import MyOrdersPage from "@/pages/MyOrdersPage";
import MyOrderDetailsPage from "@/pages/MyOrderDetailsPage";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Customers from "@/pages/admin/Customers";
import Messages from "@/pages/admin/Messages";
import Content from "@/pages/admin/Content";
import Marketing from "@/pages/admin/Marketing";
import Inventory from "@/pages/admin/Inventory";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import EmailManagement from "@/pages/admin/EmailManagement";
import Shipping from "@/pages/admin/Shipping";
import AdminSolarCalculator from "@/pages/admin/SolarCalculator";
import SolarReports from "@/pages/admin/SolarReports";
import CCTVCalculator from "@/pages/admin/CCTVCalculator";
import CCTVReports from "@/pages/admin/CCTVReports";
import MachineCalculator from "@/pages/admin/MachineCalculator";
import MachineReports from "@/pages/admin/MachineReports";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
      try {
        const colors = JSON.parse(savedTheme);
        const root = document.documentElement;
        
        const hexToHSL = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          if (!result) return '0 0% 0%';
          
          let r = parseInt(result[1], 16) / 255;
          let g = parseInt(result[2], 16) / 255;
          let b = parseInt(result[3], 16) / 255;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
              case g: h = ((b - r) / d + 2) / 6; break;
              case b: h = ((r - g) / d + 4) / 6; break;
            }
          }

          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };

        root.style.setProperty('--primary', hexToHSL(colors.primary));
        root.style.setProperty('--accent', hexToHSL(colors.accent));
        root.style.setProperty('--background', hexToHSL(colors.background));
        root.style.setProperty('--foreground', hexToHSL(colors.foreground));
        root.style.setProperty('--muted', hexToHSL(colors.muted));
      } catch (error) {
        console.error('Error applying custom theme:', error);
      }
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout><HomePage /></Layout>} />
                  <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
                  <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
                  <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                  <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
                  <Route path="/products/:id" element={<Layout><ProductDetailsPage /></Layout>} />
                  <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                  <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
                  <Route path="/blog/search" element={<Layout><ArticlesSearchPage /></Layout>} />
                  <Route path="/blog/:id" element={<Layout><BlogPostPage /></Layout>} />
                  <Route path="/newsletter" element={<Layout><NewsletterPage /></Layout>} />
                  <Route path="/solar-calculator" element={<Layout><SolarCalculatorPage /></Layout>} />
                  <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
                  <Route path="/terms" element={<Layout><TermsOfServicePage /></Layout>} />
                  <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                  <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
                  <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
                  <Route path="/order-tracking" element={<Layout><OrderTrackingPage /></Layout>} />
                  <Route path="/order-tracking/:orderId" element={<Layout><OrderTrackingPage /></Layout>} />
                  <Route path="/my-orders" element={<Layout><MyOrdersPage /></Layout>} />
                  <Route path="/my-orders/:orderId" element={<Layout><MyOrderDetailsPage /></Layout>} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/customers" element={<ProtectedRoute><AdminLayout><Customers /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/messages" element={<ProtectedRoute><AdminLayout><Messages /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/content" element={<ProtectedRoute><AdminLayout><Content /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/marketing" element={<ProtectedRoute><AdminLayout><Marketing /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/inventory" element={<ProtectedRoute><AdminLayout><Inventory /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/emails" element={<ProtectedRoute><AdminLayout><EmailManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/shipping" element={<ProtectedRoute><AdminLayout><Shipping /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/solar-calculator" element={<ProtectedRoute><AdminLayout><AdminSolarCalculator /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/solar-reports" element={<ProtectedRoute><AdminLayout><SolarReports /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/cctv-calculator" element={<ProtectedRoute><AdminLayout><CCTVCalculator /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/cctv-reports" element={<ProtectedRoute><AdminLayout><CCTVReports /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/machine-calculator" element={<ProtectedRoute><AdminLayout><MachineCalculator /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/machine-reports" element={<ProtectedRoute><AdminLayout><MachineReports /></AdminLayout></ProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AIChatbot />
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;
