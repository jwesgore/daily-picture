import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  favorite_team_id: number | null;
  favorite_player_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateFavorites: (teamId?: number | null, playerId?: number | null, avatarUrl?: string | null) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to initialize auth session:', error);
        }

        const sessionUserId = session?.user?.id ?? localStorage.getItem('userId');
        if (sessionUserId) {
          await loadUserProfile(sessionUserId);
        }
      } catch (e) {
        console.error('Failed to initialize auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user?.id;
      if (nextUserId) {
        loadUserProfile(nextUserId);
      } else {
        clearCachedUser();
      }
    });

    initAuth();

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const clearCachedUser = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setUser(null);
  };

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to load user profile:', error);
      return;
    }

    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('userId', data.id);
  };

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const authUserId = data.user?.id;
    if (!authUserId) {
      throw new Error('Unable to find user profile');
    }

    await loadUserProfile(authUserId);
  };

  const signup = async (username: string, password: string) => {
    // Use Supabase Auth for credentials; username is used as the email identifier here.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: username,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
      throw new Error('Failed to finalize account creation');
    }

    // Create profile row in public.users keyed to auth.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert(
        {
          id: authUserId,
          username,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to create user profile');
    }

    localStorage.setItem('userId', profile.id);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    clearCachedUser();
  };

  const updateFavorites = async (teamId?: number | null, playerId?: number | null, avatarUrl?: string | null) => {
    if (!user) return;

    const updates: Partial<User> = {};
    if (teamId !== undefined) updates.favorite_team_id = teamId;
    if (playerId !== undefined) updates.favorite_player_id = playerId;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    const updatedUser = { ...user, ...updates } as User;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, logout, updateFavorites }}>
      {children}
    </UserContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within UserProvider');
  }
  return context;
}
