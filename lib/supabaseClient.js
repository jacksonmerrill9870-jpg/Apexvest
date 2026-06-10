import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

export const supabase = isValidUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signUp: async () => ({ data: {}, error: new Error("Supabase is not configured") }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Supabase is not configured") }),
        signOut: async () => {},
        getUser: async () => ({ data: { user: null }, error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: async () => ({ data: [], error: null })
          }),
          order: () => ({
            eq: async () => ({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: async () => ({ data: null, error: null })
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: null })
        })
      })
    };

