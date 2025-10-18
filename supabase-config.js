// Supabase configuration
const SUPABASE_URL = 'https://njxapbjspcnrmyfhgveg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeGFwYmpzcGNucm15ZmhndmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODcyMTcsImV4cCI6MjA3NjM2MzIxN30.ntIZf-9HXLf9Okly6jA9QrHM-WIENdWMTZPqPQYP7XU';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
