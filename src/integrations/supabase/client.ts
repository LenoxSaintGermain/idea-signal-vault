// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eposrjyzwwppcapbmvbj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwb3Nyanl6d3dwcGNhcGJtdmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTkyOTcsImV4cCI6MjA2NDIzNTI5N30.qsQ07s-lG90UnaqmCRqdXjFiclJEjbnmRZhhbSnOBg0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);