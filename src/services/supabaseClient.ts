import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

const isValidUrl = (url: string | undefined) => {
  if (!url) return false;
  try {
    return new URL(url).protocol.startsWith('http');
  } catch (e) {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(finalUrl, finalKey);
