import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.warn(
    "Supabase not fully configured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing",
  );
}

export const supabasePublic = createClient(url, anonKey, {
  auth: { persistSession: false },
});

/** Server-side client — must use the service role key, not the anon key. */
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
