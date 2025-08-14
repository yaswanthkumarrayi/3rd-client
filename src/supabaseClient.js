import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuxgxfgbzuqkepqxcuqy.supabase.co';
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eGd4ZmdienVxa2VwcXhjdXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTIyNDMsImV4cCI6MjA3MDcyODI0M30.7W-k2C7mhKwAshFs5Y277Ygg58iRiClTIiTe2Q-A6NA';

export const supabase = createClient(supabaseUrl, supabaseKey);