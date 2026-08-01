import { supabase } from '../lib/supabase';

/**
 * Sign in admin user using Supabase Auth.
 */
export async function loginAdmin(email, password) {
  const cleanEmail = email.trim();

  // Primary: Sign in with password
  let { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  // If email needs confirmation or user does not exist yet, attempt signup to register admin
  if (error && (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed'))) {
    const signUpRes = await supabase.auth.signUp({
      email: cleanEmail,
      password
    });

    if (!signUpRes.error && signUpRes.data?.session) {
      return {
        user: signUpRes.data.user,
        session: signUpRes.data.session,
        error: null
      };
    }

    // Try signing in once more
    const retryRes = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (!retryRes.error && retryRes.data?.session) {
      return {
        user: retryRes.data.user,
        session: retryRes.data.session,
        error: null
      };
    }
  }

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return {
    user: data.user,
    session: data.session,
    error: null
  };
}

/**
 * Sign out admin user from Supabase Auth.
 */
export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase sign out error:', error.message);
  }
  return true;
}

/**
 * Retrieve current active session from Supabase Auth.
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error.message);
    return null;
  }
  return data.session;
}

/**
 * Subscribe to Supabase Auth state changes.
 */
export function subscribeToAuthChanges(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
