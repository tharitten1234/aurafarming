import type { Task } from '../types';
import { db, check } from './supabase';

export async function listMissions(): Promise<Task[]> {
  const bangkokDay=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Bangkok'}));
  bangkokDay.setDate(bangkokDay.getDate()-((bangkokDay.getDay()+6)%7));
  const week=`${bangkokDay.getFullYear()}-${String(bangkokDay.getMonth()+1).padStart(2,'0')}-${String(bangkokDay.getDate()).padStart(2,'0')}`;
  const { data, error } = await db().from('user_missions').select('*, missions(*), plants!inner(nickname,common_name,archived_at)').is('plants.archived_at',null)
    .eq('week_start',week).order('created_at', { ascending: true });
  check(error);
  return (data ?? []).map(row => ({
    id: row.id, kind: row.missions.kind, title: row.missions.title, reward: '+10 Aura',
    rewardPoints: 10, plantId: row.plant_id,
    plantName: row.plants.nickname, plantSpecies: row.plants.common_name,
    icon: row.missions.icon, iconBg: 'bg-blue-100', instruction: row.missions.instruction,
    tip: row.missions.tip, isCompleted: row.status === 'completed',
    actionText: row.missions.action_text,
    statusText: row.status === 'completed' ? 'สำเร็จแล้ว' : row.status === 'postponed' ? 'เลื่อนไปพรุ่งนี้' :
      row.status === 'skipped' ? 'ข้ามสัปดาห์นี้' : 'แตะเพื่อดู',
  }));
}
export async function updateMission(id: string, status: 'completed' | 'postponed' | 'skipped') {
  const { error } = await db().rpc('set_mission_status', { target_mission: id, next_status: status });
  check(error);
}
