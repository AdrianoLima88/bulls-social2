import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  user_type: string;
  followers_count: number;
  following_count: number;
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
  passwordRecovery: boolean;
  signUp: (email: string, password: string, username: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  completeMFAVerification: () => void;
  updateEmail: (newEmail: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const mfaVerifiedRef = useRef(false);

  const checkMFA = async () => {
    // If MFA was already verified in this session, skip check
    if (mfaVerifiedRef.current) return false;

    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
        setMfaRequired(true);
        setMfaVerified(false);
        return true;
      }
    } catch (e) {
      console.error('MFA check error:', e);
    }
    setMfaRequired(false);
    return false;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const needsMFA = await checkMFA();
        if (!needsMFA) {
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the "reset password" link from their email.
        // Show the reset-password screen instead of running the normal app gates.
        setSession(session);
        setUser(session?.user ?? null);
        setPasswordRecovery(true);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const needsMFA = await checkMFA();
        if (!needsMFA) {
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setMfaRequired(false);
        setMfaVerified(false);
        mfaVerifiedRef.current = false;
        setPasswordRecovery(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeMFAVerification = () => {
    // Mark as verified so onAuthStateChange doesn't re-trigger MFA check
    mfaVerifiedRef.current = true;
    setMfaRequired(false);
    setMfaVerified(true);
    if (user) loadProfile(user.id);
  };

  const loadProfile = async (userId: string, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return loadProfile(userId, retries - 1);
      }

      if (!data) console.error('Profile not found for user:', userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, name: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) return { error: { message: 'Username already taken' } };

      const { error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, name } }
      });

      if (authError) return { error: authError };
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Sign in error:', error);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setMfaRequired(false);
    setMfaVerified(false);
    mfaVerifiedRef.current = false;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) return { error };
      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Change the logged-in user's email. Supabase sends a confirmation link
  // (to the new address, and to the old one if "secure email change" is on)
  // — the email only actually changes once that link is clicked.
  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    return { error };
  };

  // Change the logged-in user's password. Works both for a normal
  // "change password" flow and right after a PASSWORD_RECOVERY event.
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setPasswordRecovery(false);
    return { error };
  };

  // "Forgot password" — sends a reset link to the given email.
  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  const clearPasswordRecovery = () => setPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      mfaRequired, mfaVerified, passwordRecovery,
      signUp, signIn, signOut, updateProfile,
      completeMFAVerification,
      updateEmail, updatePassword, resetPasswordForEmail, clearPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
