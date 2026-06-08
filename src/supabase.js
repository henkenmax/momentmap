import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hxoxztkdmdtffycpwvah.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4b3h6dGtkbWR0ZmZ5Y3B3dmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjA1NDksImV4cCI6MjA5NjQzNjU0OX0.OpDcrqzkBrostEQdCDeimBFf_gZLB9LfWvEKyDxS9CA";

export const supabase = createClient(supabaseUrl, supabaseKey);