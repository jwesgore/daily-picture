import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  username: string;
  password: string;
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

  // Initialize auth session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          await loadUserProfile(userId);
        }
      } catch (e) {
        console.error('Failed to initialize auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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
  };

  const login = async (username: string, password: string) => {
    // Query for user by username
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (queryError || !users) {
      throw new Error('Invalid username or password');
    }

    // Verify password (in production, use proper password hashing like bcrypt)
    if (users.password !== password) {
      throw new Error('Invalid username or password');
    }

    // Store user session
    localStorage.setItem('user', JSON.stringify(users));
    localStorage.setItem('userId', users.id);
    setUser(users);
  };

  const signup = async (username: string, password: string) => {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          password,
          display_name: username,
        },
      ])
      .select()
      .single();

    if (createError || !newUser) {
      throw new Error('Failed to create account');
    }

    // Store user session
    localStorage.setItem('userId', newUser.id);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateFavorites = async (teamId?: number | null, playerId?: number | null, avatarUrl?: string | null) => {
    if (!user) return;

    const updates: any = {};
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
