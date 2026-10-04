import type {Plant, PlantCandidate} from '../types';

const dayFormatter=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'});
export function bangkokDate(now=new Date()) {
  const parts=dayFormatter.formatToParts(now);
  const part=(type:string)=>parts.find(p=>p.type===type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function bangkokWeek(now=new Date()) {
  const day=new Date(`${bangkokDate(now)}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);
  return day.toISOString().slice(0,10);
}
export function currentCareStreak(streak:number,lastCareDate:string|null,now=new Date()) {
  const today=bangkokDate(now),yesterday=new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate()-1);
  return lastCareDate===today||lastCareDate===yesterday.toISOString().slice(0,10)?streak:0;
}
export function careStatus(row:{care_status:Plant['careStatus'];last_watered_at:string|null;last_checked_at:string|null;moisture_result:string|null;created_at:string},candidate:PlantCandidate,now=Date.now()):Plant['careStatus'] {
  const checked=Date.parse(row.last_checked_at??''),watered=Date.parse(row.last_watered_at??'');
  if(Number.isFinite(checked) && (!Number.isFinite(watered)||checked>watered) && now-checked<86400000){
    if(row.moisture_result==='moist'||row.moisture_result==='wet')return 'good';
    if(row.moisture_result==='dry')return 'needs-water';
  }
  // Calendar intervals are reminders to inspect soil, not proof of thirst.
  return row.care_status==='needs-water'?'good':row.care_status;
}
export function missionCare(kind:string,candidate:PlantCandidate) {
  const moistureTip='ตรวจดินก่อนตัดสินใจรดน้ำ หากยังชื้นหรือแฉะ ให้งดรดน้ำและบันทึกผลได้ ถือว่าดูแลสำเร็จ';
  if(kind==='moisture')return {instruction:`${candidate.commonName}: ${candidate.description || 'ตรวจความชื้นดินและการระบายน้ำก่อนดูแล'}`,tip:moistureTip};
  if(kind==='wipe'){
    const broadLeaf=/^(Monstera deliciosa|Ficus elastica|Ficus lyrata|Epipremnum aureum|Spathiphyllum wallisii|Dieffenbachia seguine|Calathea orbifolia|Zamioculcas zamiifolia|Sansevieria trifasciata|Dracaena trifasciata)$/i.test(candidate.scientificName.trim());
    return broadLeaf?{title:'ตรวจใบและเช็ดฝุ่นเมื่อเหมาะสม',instruction:`ตรวจใบของ${candidate.commonName} หากมีฝุ่นจึงเช็ดเบา ๆ และสังเกตแมลงใต้ใบ`,tip:'ไม่ต้องเช็ดเมื่อใบสะอาดแล้ว หลีกเลี่ยงการทำให้ใบเสียหาย'}:
      {title:'ตรวจพืชและแมลง',icon:'🔎',actionText:'บันทึกการตรวจ',instruction:`ตรวจ${candidate.commonName} สังเกตแมลง ใบหรือยอดที่เปลี่ยนแปลง โดยไม่บังคับเช็ดใบ`,tip:'พืชมีหนาม ใบอ่อน หรือใบมีขน ให้สังเกตแทนการเช็ด ไม่ตัดแต่งหรือใส่ปุ๋ยโดยไม่มีเหตุจำเป็น'};
  }
  return {instruction:`บันทึกภาพ${candidate.commonName} ในมุมใกล้เคียงภาพก่อนหน้า พร้อมวันที่และหมายเหตุ`,tip:'ภาพใช้ติดตามการเปลี่ยนแปลงด้วยตนเอง ไม่ใช่ผลตรวจสุขภาพหรือโรคอัตโนมัติ'};
}
