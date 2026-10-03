import { identificationSchema } from '../../supabase/functions/_shared/identification';
import { db } from './supabase';
import { uploadImage, signedImage, removeImage } from './images';

let retryNotBefore = 0;
const failureMessages:Record<string,string>={GEMINI_DAILY_QUOTA:'โควตา Gemini ประจำวันหมด กรุณารอโควตารีเซ็ตหรือตรวจโควตาใน Google AI Studio',GEMINI_UNAVAILABLE:'Gemini ไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ใน 30 วินาที',GEMINI_TIMEOUT:'Gemini ตอบช้าเกินกำหนด กรุณาลองใหม่ใน 30 วินาที',GEMINI_CONFIGURATION:'Gemini ปฏิเสธสิทธิ์ของเซิร์ฟเวอร์ กรุณาตรวจ API key และโปรเจกต์ Google AI'};

export async function analyzePlant(file: Blob) {
  if(Date.now()<retryNotBefore)throw new Error(`กรุณารอ ${Math.ceil((retryNotBefore-Date.now())/1000)} วินาทีก่อนสแกนใหม่`);
  const imagePath = await uploadImage(file, 'scans');
  try {
    const image = await signedImage(imagePath);
    const { data, error } = await db().functions.invoke('analyze-plant', { body: { imagePath }, timeout: 60000 });
    if (error) {
      const failure = error.context instanceof Response ? await error.context.json().catch(()=>null) : null;
      const seconds = typeof failure?.retryAfterSeconds==='number' ? Math.max(1,Math.min(86400,failure.retryAfterSeconds)) : 0;
      if(seconds) retryNotBefore=Date.now()+seconds*1000;
      const text=failure?.code==='GEMINI_RATE_LIMIT' ? `Gemini จำกัดการใช้งานชั่วคราว กรุณารอ ${seconds||60} วินาทีแล้วลองใหม่` : failureMessages[failure?.code];
      throw new Error(text ?? 'วิเคราะห์ภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
    const identification = identificationSchema.parse(data?.identification);
    if (typeof data.scanId !== 'string') throw new Error();
    return { scanId: data.scanId as string, imagePath, image, identification };
  } catch (error) {
    // Failed scans retain their server-side audit row; remove unused image on failure.
    await removeImage(imagePath).catch(() => undefined);
    if (error instanceof Error && /^(วิเคราะห์|Gemini|โควตา)/.test(error.message)) throw error;
    throw new Error('ผลวิเคราะห์ไม่สมบูรณ์ กรุณาถ่ายภาพใหม่');
  }
}
