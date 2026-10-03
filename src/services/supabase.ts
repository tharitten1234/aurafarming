import { createClient } from '@supabase/supabase-js';

const env = import.meta.env ?? {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isConfigured = Boolean(url && key && !url.includes('your-project') && !key.includes('your-publishable'));
export const supabase = isConfigured ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;

export function db() {
  if (!supabase) throw new Error('กรุณาตั้งค่า Supabase ตาม README ก่อนใช้งาน');
  return supabase;
}
export function check(error: unknown) {
  if (error) throw new Error('เชื่อมต่อหรือบันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
}
export function message(error: unknown) {
  return error instanceof Error && !/fetch|jwt|sql|relation|constraint|token|key/i.test(error.message)
    ? error.message : 'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง';
}
