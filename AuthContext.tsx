import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role from database only - no client-side hardcoded checks
  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      return !error && !!data;
    } catch {
      return false;
    }
  };

  const updateUserState = async (supabaseSession: Session | null) => {
    if (supabaseSession?.user) {
      const supabaseUser = supabaseSession.user;
      // Only check database for admin role - no client-side email checks
      const hasAdminRole = await checkAdminRole(supabaseUser.id);
      
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
        role: hasAdminRole ? 'admin' : 'user'
      };
      
      setUser(authUser);
      setSession(supabaseSession);
      setIsAdmin(hasAdminRole);
    } else {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Defer the admin check to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            updateUserState(session);
          }, 0);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateUserState(session);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setIsLoading(false);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'بيانات الدخول غير صحيحة' };
        }
        
        return { success: false, error: error.message };
      }

      // Check if user has admin role in database
      if (data.user) {
        const hasRole = await checkAdminRole(data.user.id);
        if (!hasRole) {
          // User exists but is not an admin - sign them out
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, error: 'ليس لديك صلاحيات الوصول للوحة الإدارة' };
        }
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
