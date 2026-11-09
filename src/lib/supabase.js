import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL || 'https://pndecnztjnmjkfdovfyd.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_17Udm-8Qn-zo79fXBlE5Sg_MdUPBIwb';
export const configured=Boolean(url&&key);
export const supabase=configured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
