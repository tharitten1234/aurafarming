import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { normalizePlantnet } from '../_shared/plantnet.ts';
import { enrichWithGemini, GeminiCareError } from '../_shared/gemini-care.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const requestSchema = z.object({ imagePath: z.string().max(240) }).strict();
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json' },
});
class UpstreamError extends Error {
  constructor(public status: number, public retryAfterSeconds = 60) { super(`upstream:${status}`); }
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const plantnetKey = Deno.env.get('PLANTNET_API_KEY');
  if (!url || !serviceKey || !plantnetKey) {
    console.warn('analyze-plant missing-environment', {
      supabaseUrl: Boolean(url), serviceRole: Boolean(serviceKey), plantnet: Boolean(plantnetKey),
    });
    return reply({ code:'PLANTNET_CONFIGURATION', error: 'บริการ Pl@ntNet ยังไม่พร้อมใช้งาน กรุณาตรวจการตั้งค่าฝั่งเซิร์ฟเวอร์' }, 503);
  }
  const token = req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return reply({ error: 'กรุณาเริ่มเซสชันใหม่' }, 401);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  let scanId: string | undefined;
  let ownerId: string | undefined;
  try {
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return reply({ error: 'เซสชันหมดอายุ กรุณาโหลดใหม่' }, 401);
    ownerId = auth.user.id;
    if (Number(req.headers.get('Content-Length') ?? '0') > 2048) return reply({ error: 'คำขอไม่ถูกต้อง' }, 400);
    const text = await req.text();
    if (text.length > 2048) return reply({ error: 'คำขอไม่ถูกต้อง' }, 400);
    const parsed = requestSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return reply({ error: 'คำขอไม่ถูกต้อง' }, 400);
    const { imagePath } = parsed.data;
    if (!imagePath.startsWith(`${ownerId}/scans/`) || !/^[a-f0-9-]{36}\/scans\/[a-f0-9-]{36}\.jpg$/.test(imagePath))
      return reply({ error: 'ไม่สามารถเข้าถึงภาพนี้ได้' }, 403);
    const { count, error: limitError } = await admin.from('plant_scans').select('id', { count: 'exact', head: true })
      .eq('user_id', ownerId).gte('created_at', new Date(Date.now() - 3600000).toISOString());
    if (limitError) throw new Error('database');
    if ((count ?? 0) >= 20) return reply({ error: 'สแกนหลายครั้งแล้ว กรุณาลองอีกครั้งภายหลัง' }, 429);
    const { data: image, error: imageError } = await admin.storage.from('plant-images').download(imagePath);
    if (imageError || !image) return reply({ error: 'ไม่พบภาพ กรุณาอัปโหลดใหม่' }, 400);
    if (image.size === 0 || image.size > 5 * 1024 * 1024) return reply({ error: 'ขนาดภาพไม่ถูกต้อง' }, 400);
    const bytes = new Uint8Array(await image.arrayBuffer());
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return reply({ error: 'กรุณาใช้ภาพ JPEG ที่ถูกต้อง' }, 400);
    // Keep the existing audit column compatible with historical scans and manual-catalog records.
    const inserted = await admin.from('plant_scans').insert({ user_id: ownerId, image_path: imagePath, gemini_model: 'plantnet-v2/all' }).select('id').single();
    if (inserted.error || !inserted.data) throw new Error('database');
    scanId = inserted.data.id;
    const endpoint = new URL('https://my-api.plantnet.org/v2/identify/all');
    endpoint.searchParams.set('api-key', plantnetKey);
    endpoint.searchParams.set('lang', 'en');
    endpoint.searchParams.set('nb-results', '5');
    endpoint.searchParams.set('no-reject', 'false');
    const deadline = AbortSignal.timeout(45000);
    const identify = () => {
      const form = new FormData();
      form.append('organs', 'auto');
      form.append('images', new Blob([bytes], {type:'image/jpeg'}), 'plant.jpg');
      return fetch(endpoint, { method:'POST', signal:deadline, body:form });
    };
    let response = await identify();
    for (let retry = 0; retry < 2 && [502, 503, 504].includes(response.status); retry++) {
      await response.body?.cancel();
      await new Promise(resolve => setTimeout(resolve, 1200 * 2 ** retry));
      deadline.throwIfAborted();
      response = await identify();
    }
    let raw: unknown;
    if (response.status === 404) {
      const failure = await response.json().catch(() => ({}));
      if (!/species not found/i.test(String(failure?.message ?? failure?.error ?? ''))) throw new UpstreamError(404);
      raw = {results:[]};
    } else if (!response.ok) {
      const retryAfter = Number.parseFloat(response.headers.get('Retry-After') ?? '60');
      console.warn('analyze-plant upstream', {status:response.status});
      throw new UpstreamError(response.status, Number.isFinite(retryAfter) ? Math.max(1,Math.min(86400,Math.ceil(retryAfter))) : 60);
    } else raw = await response.json();
    const {identification: recognized, response: audit} = normalizePlantnet(raw);
    const identification = await enrichWithGemini(recognized);
    const status = !identification.isPlant ? 'not_plant' : identification.confidence < 0.6 ? 'uncertain' : 'completed';
    // Store validated fields only: no upstream query URLs, API keys or submitted bytes.
    const { error } = await admin.from('plant_scans').update({ status, identification, raw_response: {...audit,careProvider:recognized.isPlant?'gemini':null} })
      .eq('id', scanId).eq('user_id', ownerId);
    if (error) throw new Error('database');
    return reply({ scanId, identification });
  } catch (error) {
    if (scanId && ownerId) await admin.from('plant_scans').update({ status: 'failed' }).eq('id', scanId).eq('user_id', ownerId);
    const category = error instanceof SyntaxError ? 'invalid-json' : error instanceof z.ZodError ? 'invalid-output' :
      error instanceof UpstreamError ? `upstream:${error.status}` : 'service-error';
    console.warn('analyze-plant failed', category);
    if(error instanceof GeminiCareError){
      const messages:Record<string,string>={
        GEMINI_CARE_CONFIGURATION:'Gemini สำหรับแปลชื่อและแนะนำการดูแลยังไม่พร้อม กรุณาตรวจคีย์และรุ่นโมเดลฝั่งเซิร์ฟเวอร์',
        GEMINI_CARE_RATE_LIMIT:'Gemini สำหรับแปลชื่อและแนะนำการดูแลติดโควตา กรุณารอสักครู่แล้วลองใหม่',
        GEMINI_CARE_TIMEOUT:'Gemini แปลชื่อและแนะนำการดูแลช้าเกินกำหนด กรุณาลองใหม่',
        GEMINI_CARE_UNAVAILABLE:'Gemini สำหรับแปลชื่อและแนะนำการดูแลไม่พร้อมชั่วคราว กรุณาลองใหม่',
        GEMINI_CARE_INVALID:'Gemini ส่งชื่อไทยหรือคำแนะนำไม่ครบ กรุณาลองสแกนใหม่',
      };
      return reply({code:error.code,error:messages[error.code],retryAfterSeconds:error.retryAfterSeconds},error.status);
    }
    if(error instanceof UpstreamError) {
      if(error.status===429) return reply({code:'PLANTNET_RATE_LIMIT',retryAfterSeconds:error.retryAfterSeconds,error:`Pl@ntNet จำกัดการใช้งานหรือโควตาหมด กรุณารอ ${error.retryAfterSeconds} วินาทีแล้วลองใหม่ หรือตรวจโควตาบัญชี Pl@ntNet`},429);
      if([502,503,504].includes(error.status))return reply({code:'PLANTNET_UNAVAILABLE',retryAfterSeconds:30,error:'Pl@ntNet ไม่พร้อมใช้งานชั่วคราว ลองอีกครั้งใน 30 วินาที'},503);
      if([401,403].includes(error.status))return reply({code:'PLANTNET_CONFIGURATION',error:'Pl@ntNet ปฏิเสธสิทธิ์ของเซิร์ฟเวอร์ กรุณาตรวจ API key และการตั้งค่าบัญชี Pl@ntNet'},503);
      if(error.status===400 || error.status===413 || error.status===415)return reply({code:'PLANTNET_IMAGE',error:'Pl@ntNet อ่านภาพนี้ไม่ได้ กรุณาถ่ายภาพหรือเลือกภาพใหม่'},400);
    }
    if(error instanceof Error && ['TimeoutError','AbortError'].includes(error.name))return reply({code:'PLANTNET_TIMEOUT',retryAfterSeconds:30,error:'Pl@ntNet ตอบช้าเกินกำหนด กรุณารอ 30 วินาทีแล้วลองใหม่'},504);
    return reply({ error: 'วิเคราะห์ภาพไม่สำเร็จ กรุณาลองอีกครั้ง' }, error instanceof SyntaxError && !scanId ? 400 : 502);
  }
}

if (import.meta.main) Deno.serve(handleRequest);
