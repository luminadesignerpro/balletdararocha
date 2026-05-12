import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtlayumrgozuysknuypg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bGF5dW1yZ296dXlza251eXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjk0NTgsImV4cCI6MjA5Mzg0NTQ1OH0._Pjaeplhg86eYcUTTD6avid2Nqy-f6OTginSXrgxPuo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
