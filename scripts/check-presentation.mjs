import {readFile} from 'node:fs/promises';

// Read-only checks: no accounts, uploads, database writes or AI requests.
let failed=false;
const check=(label,ok,detail='')=>{console.log(`${ok?'PASS':'FAIL'} ${label}${detail?` — ${detail}`:''}`);if(!ok)failed=true;};
try{
 const text=await readFile(new URL('../.env.local',import.meta.url),'utf8');
 const env={...process.env};
 for(const line of text.split(/\r?\n/)){
  const match=line.match(/^\s*(VITE_[A-Z_]+)\s*=\s*(.*?)\s*$/);
  if(match)env[match[1]]=match[2].replace(/^(['"])(.*)\1$/,'$2');
 }
 const base=env.VITE_SUPABASE_URL,key=env.VITE_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)throw Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
 new URL(base);
 check('Local configuration',true);
 const headers={apikey:key};
 try{
  const response=await fetch(`${base}/auth/v1/settings`,{headers,signal:AbortSignal.timeout(12000)});
  check('Supabase Auth reachable',response.ok);
  if(response.ok){
   const settings=await response.json();
   check('Email sign-in enabled',settings.external?.email===true);
   check('Guest sign-in enabled',settings.external?.anonymous_users===true);
   console.log(`INFO Email confirmation ${settings.mailer_autoconfirm?'not required':'required'}; Google ${settings.external?.google?'enabled':'disabled'}`);
  }
 }catch{check('Supabase Auth reachable',false,'Check internet and project Resume status');}
 try{
  const response=await fetch(`${base}/functions/v1/analyze-plant`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(12000)});
  check('Scan endpoint reachable and rejects missing session',response.status===401,`HTTP ${response.status}`);
 }catch{check('Scan endpoint reachable',false);}
 try{
  const appUrl=process.argv[2]??'http://127.0.0.1:3000/';
  const response=await fetch(appUrl,{signal:AbortSignal.timeout(12000)});
  check('Web app reachable',response.ok&&(await response.text()).includes('AuraFarming'));
 }catch{check('Web app reachable',false,'Start npm run dev first');}
 console.log('INFO This does not verify AI quota, email delivery, camera hardware or full feature flows.');
}catch(error){check('Preflight configuration',false,error.message);}
if(failed)process.exitCode=1;
