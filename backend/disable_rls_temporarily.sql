-- Temporarily disable RLS for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- This will allow the API to work without RLS policies
-- You can re-enable RLS later with proper policies
