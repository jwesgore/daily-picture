import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  username: string;
  favorite_color?: string;
  favorite_player_id?: number;
  favorite_team_id?: number;
  profile_picture_url?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateFavorites: (teamId?: number | null, playerId?: number | null, color?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      throw new Error('Invalid username or password');
    }

    // In production, use bcrypt to compare passwords
    if (data.password !== password) {
      throw new Error('Invalid username or password');
    }

    const userData: User = {
      id: data.id,
      username: data.username,
      favorite_color: data.favorite_color,
      favorite_player_id: data.favorite_player_id,
      favorite_team_id: data.favorite_team_id,
      profile_picture_url: data.profile_picture_url,
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password }])
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create account');
    }

    const userData: User = {
      id: data.id,
      username: data.username,
      favorite_color: data.favorite_color,
      favorite_player_id: data.favorite_player_id,
      favorite_team_id: data.favorite_team_id,
      profile_picture_url: data.profile_picture_url,
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateFavorites = async (teamId?: number | null, playerId?: number | null, color?: string) => {
    if (!user) return;

    const updates: any = {};
    if (teamId !== undefined) updates.favorite_team_id = teamId;
    if (playerId !== undefined) updates.favorite_player_id = playerId;
    if (color !== undefined) updates.favorite_color = color;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    const updatedUser = { ...user, ...updates };
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
