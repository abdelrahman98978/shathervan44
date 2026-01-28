import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    discount_price: number | null;
    images: string[];
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const sessionId = getSessionId();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchCart = async () => {
    if (!user) {
      // لا يوجد مستخدم مسجّل، نستخدم سلة فارغة في الواجهة فقط
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name_ar,
            name_en,
            price,
            discount_price,
            images,
            stock_quantity
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedItems = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'يرجى تسجيل الدخول',
        description: 'يجب تسجيل الدخول لإضافة المنتجات إلى السلة',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if item already in cart
      const existingItem = items.find(item => item.product_id === productId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          product_id: productId,
          quantity,
        });

      if (error) throw error;

      await fetchCart();
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة المنتج إلى السلة بنجاح',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة المنتج',
        variant: 'destructive',
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الكمية',
        variant: 'destructive',
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchCart();
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المنتج من السلة',
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المنتج',
        variant: 'destructive',
      });
    }
  };

  const clearCart = async () => {
    try {
      if (!user) {
        setItems([]);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      sessionId,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
