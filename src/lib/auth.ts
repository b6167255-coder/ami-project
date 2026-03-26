import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'kindergarten_teacher' | 'substitute_teacher';
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: 'kindergarten_teacher' | 'substitute_teacher'
): Promise<AuthUser | null> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw authError;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([
      {
        supabase_id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        role,
      },
    ])
    .select()
    .single();

  if (userError) {
    throw userError;
  }

  if (role === 'substitute_teacher') {
    await supabase
      .from('substitute_profiles')
      .insert([{ user_id: authData.user.id }]);
  }

  return userData as AuthUser;
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw error;
  }

  const { data: userData } = await supabase
    .from('users')
    .select()
    .eq('supabase_id', data.user.id)
    .single();

  return userData as AuthUser;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session?.user) {
    return null;
  }

  const { data } = await supabase
    .from('users')
    .select()
    .eq('supabase_id', sessionData.session.user.id)
    .single();

  return data as AuthUser;
}

export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      (async () => {
        const { data } = await supabase
          .from('users')
          .select()
          .eq('supabase_id', session.user.id)
          .single();
        callback(data as AuthUser);
      })();
    } else {
      callback(null);
    }
  });
}
