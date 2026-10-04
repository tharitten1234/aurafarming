import type { Badge, UserProfile } from '../types';
import { db, check } from './supabase';
import { ASSETS } from '../data/mockData';
import { ensureSession } from './auth';
import { signedImage } from './images';
import {currentCareStreak} from './careRules';

export const emptyProfile: UserProfile = { name: 'Farmer', farmName:null, level: 1, auraScore: 0, title: 'Green Beginner',
  exp: 0, maxExp: 400, coins: 0, daysStreak: 0, avatarUrl: ASSETS.avatar, plantCount: 0, completedTasksCount: 0 };
export async function loadProfile(plantCount: number, completedTasksCount: number): Promise<UserProfile> {
  const { user } = await ensureSession();
  const { error: initError } = await db().rpc('initialize_profile'); check(initError);
  const { data, error } = await db().from('profiles').select('*').eq('user_id', user.id).single(); check(error);
  if (!data) throw new Error('โหลดโปรไฟล์ไม่ได้');
  const [completed,plantsAdded,photosRecorded]=await Promise.all([
    db().from('user_missions').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('status','completed'),
    db().from('plants').select('id',{count:'exact',head:true}).eq('user_id',user.id),
    db().from('growth_logs').select('id',{count:'exact',head:true}).eq('user_id',user.id),
  ]);
  for(const result of [completed,plantsAdded,photosRecorded])check(result.error);
  const level = Math.floor(data.aura_points / 150) + 1;
  return { name: data.farm_name ?? data.display_name, farmName:data.farm_name, level, auraScore: data.aura_points, title: level >= 5 ? 'Green Keeper' : 'Green Beginner',
    exp: data.aura_points % 150, maxExp: 150, coins: data.coins, daysStreak: currentCareStreak(data.streak,data.last_care_date), bestCareStreak:data.best_care_streak??data.streak,
    avatarUrl: data.avatar_path ? await signedImage(data.avatar_path) : ASSETS.avatar,
    plantCount, completedTasksCount:completed.count??completedTasksCount,plantsAdded:plantsAdded.count??plantCount,photosRecorded:photosRecorded.count??0 };
}
export async function updateDisplayName(name: string) {
  await ensureSession();
  if(!name.trim()||name.trim().length>80)throw new Error('กรุณาตั้งชื่อฟาร์ม 1–80 ตัวอักษร');
  const {error}=await db().rpc('set_farm_name',{new_name:name.trim()});check(error);
}
export function deriveBadges(user: UserProfile, logs: number): Badge[] {
  return [
    { id: 'badge-1', name: 'ต้นแรก', icon: '🪴', value: user.plantsAdded??user.plantCount, goal: 1, unit: 'กระถาง', description: 'เพิ่มต้นไม้ต้นแรกเข้าสู่สวน' },
    { id: 'badge-2', name: 'ดูแลต่อเนื่อง', icon: '💧', value: user.bestCareStreak??user.daysStreak, goal: 7, unit: 'วัน', description: 'บันทึกการดูแลติดต่อกัน 7 วัน' },
    { id: 'badge-3', name: 'นักบันทึก', icon: '📸', value: user.photosRecorded??logs, goal: 5, unit: 'รูป', description: 'บันทึกภาพการเติบโตครบ 5 ภาพ' },
  ].map(b => ({ id: b.id, name: b.name, icon: b.icon, description: b.description,
    status: b.value >= b.goal ? 'unlocked' : 'locked',
    statusLabel: b.value >= b.goal ? 'ปลดล็อกแล้ว ✨' : 'ล็อคอยู่ 🔒', progressText: `${Math.min(b.value, b.goal)}/${b.goal} ${b.unit}` }));
}
