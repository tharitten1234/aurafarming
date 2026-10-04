import type { Task } from '../types';
import { db, check } from './supabase';
import {bangkokWeek,missionCare} from './careRules';
import {identificationSchema} from '../../supabase/functions/_shared/identification';

export async function listMissions(): Promise<Task[]> {
  const week=bangkokWeek();
  const { data, error } = await db().from('user_missions').select('*, missions(*), plants!inner(nickname,common_name,archived_at,identification)').is('plants.archived_at',null)
    .eq('week_start',week).order('created_at', { ascending: true });
  check(error);
  return (data ?? []).map(row => ({
    id: row.id, kind: row.missions.kind, title: row.missions.title, reward: `+${row.missions.kind==='photo'?15:10} Aura`,
    rewardPoints: row.missions.kind==='photo'?15:10, plantId: row.plant_id,
    plantName: row.plants.nickname, plantSpecies: row.plants.common_name,
    icon: row.missions.icon, iconBg: 'bg-blue-100', isCompleted: row.status === 'completed',
    actionText: row.missions.action_text,
    statusText: row.status === 'completed' ? 'สำเร็จแล้ว' : row.status === 'postponed' ? `เลื่อนถึง ${new Date(row.due_at).toLocaleDateString('th-TH',{timeZone:'Asia/Bangkok'})}` :
      row.status === 'skipped' ? 'ข้ามสัปดาห์นี้' : 'แตะเพื่อดู',
    ...missionCare(row.missions.kind,identificationSchema.parse(row.plants.identification)),
  }));
}
export async function updateMission(id: string, status: 'completed' | 'postponed' | 'skipped') {
  const { error } = await db().rpc('set_mission_status', { target_mission: id, next_status: status });
  if(error?.message?.includes('Mission not due'))throw new Error('ภารกิจนี้ถูกข้ามหรือยังไม่ถึงวันที่เลื่อน กรุณารอถึงกำหนดก่อน');
  if(error?.message?.includes('Record soil check first'))throw new Error('กรุณาบันทึกผลตรวจความชื้นดินก่อนทำภารกิจนี้สำเร็จ');
  if(error?.message?.includes('Save a growth photo first'))throw new Error('กรุณาบันทึกภาพต้นไม้ก่อนทำภารกิจถ่ายภาพสำเร็จ');
  check(error);
}
