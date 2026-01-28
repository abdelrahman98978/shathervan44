import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface WishlistItem {
  id: string;
  product_id: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'mazen_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Get or create session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('wishlist_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('wishlist_session_id', sessionId);
    }
    return sessionId;
  };

  // Check auth state
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load wishlist from localStorage or database
  useEffect(() => {
    const loadWishlist = async () => {
      if (userId) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('id, product_id')
          .eq('user_id', userId);
        
        if (!error && data) {
          setWishlist(data);
        }
      } else {
        // Load from localStorage for anonymous users
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          try {
            setWishlist(JSON.parse(stored));
          } catch {
            setWishlist([]);
          }
        }
      }
    };
    loadWishlist();
  }, [userId]);

  // Save to localStorage when wishlist changes (for anonymous users)
  useEffect(() => {
    if (!userId) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, userId]);

  const addToWishlist = async (productId: string) => {
    if (isInWishlist(productId)) return;

    if (userId) {
      // Save to database
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId })
        .select('id, product_id')
        .single();
      
      if (!error && data) {
        setWishlist(prev => [...prev, data]);
        toast({
          title: language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to Wishlist',
          description: language === 'ar' ? 'تم إضافة المنتج إلى قائمة المفضلة' : 'Product added to your wishlist',
        });
      }
    } else {
      // Save to localStorage
      const newItem: WishlistItem = {
        id: `local_${Date.now()}`,
        product_id: productId,
      };
      setWishlist(prev => [...prev, newItem]);
      toast({
        title: language === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to Wishlist',
        description: language === 'ar' ? 'تم إضافة المنتج إلى قائمة المفضلة' : 'Product added to your wishlist',
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (userId) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
    }
    
    setWishlist(prev => prev.filter(item => item.product_id !== productId));
    toast({
      title: language === 'ar' ? 'تمت الإزالة' : 'Removed',
      description: language === 'ar' ? 'تم إزالة المنتج من قائمة المفضلة' : 'Product removed from your wishlist',
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const clearWishlist = async () => {
    if (userId) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId);
    }
    setWishlist([]);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
