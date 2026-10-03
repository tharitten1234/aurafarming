import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
async function main() {
 const text = await readFile('.env.local','utf8');
 const env = Object.fromEntries(text.trim().split(/\r?\n/).map(line => { const i=line.indexOf('='); return [line.slice(0,i).trim(),line.slice(i+1).trim()]; }));
 const makeClient = () => createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const client=makeClient();
 const emit=(step,ok,detail={})=>console.log(JSON.stringify({step,ok,...detail}));
 const signed=await client.auth.signInAnonymously();
 if(signed.error){emit('anonymous-auth',false,{code:signed.error.code,message:signed.error.message});process.exitCode=1;return;}
 const userId=signed.data.user.id;
 emit('anonymous-auth',true,{testUserId:userId});
 const init=await client.rpc('initialize_profile');emit('profile-init',!init.error,{code:init.error?.code});
 for(const table of ['profiles','plants','missions','user_missions','growth_logs']){
  const r=await client.from(table).select('*');emit(table,!r.error,{count:r.data?.length,code:r.error?.code});
 }
 const imageFile=process.argv[2];
 const bytes=imageFile?await readFile(imageFile):new Uint8Array([0xff,0xd8,0xff,0xd9]);
 const path=`${userId}/scans/${crypto.randomUUID()}.jpg`;
 const uploaded=await client.storage.from('plant-images').upload(path,bytes,{contentType:'image/jpeg'});
 emit('storage-upload',!uploaded.error,{message:uploaded.error?.message});
 const cleanup=[path];
 try{
  if(uploaded.error){process.exitCode=1;return;}
  const link=await client.storage.from('plant-images').createSignedUrl(path,60);emit('storage-signed-url',!link.error);
  if(link.data){const response=await fetch(link.data.signedUrl);emit('storage-download',response.ok,{bytes:(await response.arrayBuffer()).byteLength});}
  const response=await client.functions.invoke('analyze-plant',{body:{imagePath:path},timeout:60000});
  const detail=response.error?.context instanceof Response?await response.error.context.json().catch(()=>({})):response.data;
  emit('edge-function',!response.error,{status:response.error?.context?.status,result:detail?.error??detail?.identification?.isPlant});
  if(response.error){process.exitCode=1;return;}
  const result=detail.identification;
  if(!imageFile||!result.isPlant||!result.scientificName){emit('plant-identification',false,{reason:'No identified plant'});return;}
  emit('plant-identification',true,{commonName:result.commonName,scientificName:result.scientificName,confidence:result.confidence});
  const placement={low:'indoor',medium:'window',high:'balcony',unknown:'window'}[result.sunlightRequirement];
  const light=result.sunlightRequirement==='unknown'?'medium':result.sunlightRequirement;
  const saved=await client.from('plants').insert({user_id:userId,scan_id:detail.scanId,nickname:'Verification plant',common_name:result.commonName,
   scientific_name:result.scientificName,category:result.category,image_path:path,identification:result,care_info:result,aura_score:1,placement,light}).select('id,aura_score').single();
  emit('plant-save',!saved.error,{id:saved.data?.id,auraScore:saved.data?.aura_score,code:saved.error?.code});
  if(saved.error){process.exitCode=1;return;}
  const plantId=saved.data.id;
  const care=await client.rpc('record_care',{target_plant:plantId,care_kind:'moist'});emit('care-save',!care.error);
  const missions=await client.from('user_missions').select('id').eq('plant_id',plantId).eq('mission_id','wipe').single();
  if(missions.data){const done=await client.rpc('set_mission_status',{target_mission:missions.data.id,next_status:'completed'});emit('mission-complete',!done.error);}
  const growthPath=`${userId}/growth/${crypto.randomUUID()}.jpg`;cleanup.push(growthPath);
  const growthImage=await client.storage.from('plant-images').upload(growthPath,bytes,{contentType:'image/jpeg'});
  const log=growthImage.error?growthImage:await client.from('growth_logs').insert({user_id:userId,plant_id:plantId,image_path:growthPath,note:'Verification growth log',badge_label:'Test'});
  emit('growth-save',!log.error);
  const fresh=makeClient();const restored=await fresh.auth.setSession({access_token:signed.data.session.access_token,refresh_token:signed.data.session.refresh_token});
  emit('session-restore',!restored.error);
  const plants=await fresh.from('plants').select('id').eq('id',plantId);const logs=await fresh.from('growth_logs').select('id').eq('plant_id',plantId);
  emit('persistent-reload',!plants.error&&!logs.error&&plants.data.length===1&&logs.data.length===1);
  await fresh.auth.signOut({scope:'local'});
 }finally{
  const removed=await client.storage.from('plant-images').remove(cleanup);emit('storage-cleanup',!removed.error);
  await client.auth.signOut({scope:'local'});
 }
}
await main().catch(()=>{console.log(JSON.stringify({step:'transport',ok:false,message:'Connection failed'}));process.exitCode=1;});
