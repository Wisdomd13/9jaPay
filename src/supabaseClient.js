import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ruojtdomhcofvmtmhqgk.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_k65GbxMZcTgOjV-8gPiDgg_f9zppkAQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export { SUPABASE_URL, SUPABASE_PUBLIC_KEY };
export default supabase;
