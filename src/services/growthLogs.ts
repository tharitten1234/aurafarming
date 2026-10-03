import type { TimelinePhoto } from '../types';
import { db, check } from './supabase';
import { ensureSession } from './auth';
import { uploadImage, signedImage, removeImage } from './images';
import { displayDate } from './plants';

export async function listGrowthLogs(): Promise<TimelinePhoto[]> {
  const { data, error } = await db().from('growth_logs').select('*').order('created_at', { ascending: false });
  check(error);
  const seen = new Set<string>();
  return Promise.all((data ?? []).map(async row => {
    const isLatest = !seen.has(row.plant_id); seen.add(row.plant_id);
    return { id: row.id, plantId: row.plant_id, date: displayDate(row.created_at),
      badgeLabel: row.badge_label, badgeIcon: '✨', badgeColor: 'bg-[#c8e6c9] text-[#1b5e20] border-[#81c784]',
      photoUrl: await signedImage(row.image_path), caption: row.note, careActivity: row.care_activity,
      notes: row.notes, plantMatchScore: row.plant_match_score, isLatest };
  }));
}
export async function addGrowthLog(plantId: string, file: File, note: string, badge: string, careActivity = '', notes = '') {
  const { user } = await ensureSession();
  const imagePath = await uploadImage(file, 'growth');
  try {
    const { error } = await db().from('growth_logs').insert({ user_id: user.id,
      plant_id: plantId, image_path: imagePath, note, badge_label: badge, care_activity:careActivity,notes });
    check(error);
  } catch (error) { await removeImage(imagePath).catch(() => undefined); throw error; }
}
