import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://musruipvywwbmuebwqiv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11c3J1aXB2eXd3Ym11ZWJ3cWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDgyMzIsImV4cCI6MjA2ODQyNDIzMn0.Q7i7Oi-jwE7dCpWD8CoRPuyyfuZgF8en-zrVAmkbq6E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
