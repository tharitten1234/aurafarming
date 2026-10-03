import type { Session } from '@supabase/supabase-js';
import { db, check } from './supabase';

let pendingSession: Promise<Session> | undefined;
export function ensureSession(): Promise<Session> {
  return db().auth.getSession().then(({data,error})=>{check(error);if(!data.session)throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง');return data.session;});
}
export function startGuestSession(): Promise<Session> {
  // Prevent duplicate anonymous accounts during overlapping initialization.
  pendingSession ??= (async () => {
    const { data, error } = await db().auth.getSession();
    check(error);
    if (data.session) return data.session;
    const signed = await db().auth.signInAnonymously();
    if (signed.error || !signed.data.session)
      throw new Error('เริ่มเซสชันไม่ได้ กรุณาเปิด Anonymous Sign-ins ใน Supabase แล้วลองอีกครั้ง');
    return signed.data.session;
  })().finally(() => { pendingSession = undefined; });
  return pendingSession;
}
