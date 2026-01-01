
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe initialization to prevent app crash if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase URL or Key is missing! Check your environment variables.');
}

// Use placeholders to prevent createClient from throwing if keys are undefined
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey);
