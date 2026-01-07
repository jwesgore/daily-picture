import type { AuthError, AuthSession, User, UserAttributes } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// Optional fields stored on auth.user.user_metadata during signup.
export interface AuthProfileMetadata {
  username?: string;
  avatarUrl?: string;
}

function raise(error: AuthError): never {
  throw new Error(error.message);
}

// Create an auth user and attach metadata to user_metadata.
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: AuthProfileMetadata,
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: metadata,
    },
  });

  if (error) raise(error);
  return data.user;
}

// Sign in with email/password and return the auth session.
export async function signInWithEmail(email: string, password: string): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) raise(error);
  return data.session;
}

// Clear the current auth session.
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) raise(error);
}

// Fetch the current auth session (if any).
export async function getSession(): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) raise(error);
  return data.session;
}

// Fetch the current auth user (if any).
export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) raise(error);
  return data.user;
}

// Update fields on the auth user (e.g., email, password, metadata).
export async function updateUser(attributes: UserAttributes): Promise<User | null> {
  const { data, error } = await supabase.auth.updateUser(attributes);
  if (error) raise(error);
  return data.user;
}

// Send a password-reset email with redirect back to the app.
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error) raise(error);
}

// Listen for auth state changes; returns the subscription to unsubscribe when needed.
export function onAuthChange(callback: (session: AuthSession | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}
