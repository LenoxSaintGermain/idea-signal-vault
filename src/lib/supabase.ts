// Shim: re-export the configured Supabase client and types to avoid env-based initialization
export { supabase } from '@/integrations/supabase/client';
export type { Database } from '@/integrations/supabase/types';
