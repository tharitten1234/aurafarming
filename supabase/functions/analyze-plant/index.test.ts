import { handleRequest } from './index.ts';
import { normalizePlantnet } from '../_shared/plantnet.ts';
import { enrichWithGemini, GeminiCareError } from '../_shared/gemini-care.ts';

const assert=(value:unknown,message:string)=>{if(!value)throw new Error(message);};
const owner='11111111-1111-4111-8111-111111111111';
const imagePath=`${owner}/scans/22222222-2222-4222-8222-222222222222.jpg`;
const recognition={results:[{score:.09,species:{scientificNameWithoutAuthor:'Selaginella kraussiana',commonNames:['Krauss clubmoss']}},{score:.03,species:{scientificNameWithoutAuthor:'Buxus sempervirens',commonNames:['Boxwood']}}]};
const advice=(scientificName:string)=>({scientificName,commonName:scientificName==='Selaginella kraussiana'?'ซีลาจิเนลลา เคราส์เซียนา':'บ็อกซ์วูด',description:'ตรวจความชื้นดินก่อนรดน้ำ ปรับแสงให้เหมาะกับชนิดพืช',wateringIntervalDays:2,sunlightRequirement:'low',temperatureMinC:18,temperatureMaxC:30,careDifficulty:'moderate',warnings:[]});
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

Deno.test('Hybrid handler: image only to Pl@ntNet, botanical names only to Gemini, original scores and ownership',async()=>{
  const oldFetch=globalThis.fetch;
  const env=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PLANTNET_API_KEY','GEMINI_API_KEY'];
  const previous=env.map(k=>Deno.env.get(k));
  env.forEach(k=>Deno.env.set(k,k==='SUPABASE_URL'?'https://test.supabase.co':'test-only'));
  let plantnetCalls=0,geminiCalls=0,providerStatus=200,quota=0,stored:any;
  let upstream:unknown=recognition;
  globalThis.fetch=async(input,init)=>{
    const url=String(input);
    if(url.includes('/auth/v1/user'))return json({id:owner,aud:'authenticated',role:'authenticated'});
    if(url.includes('/storage/v1/object/'))return new Response(new Uint8Array([255,216,255,217]));
    if(url.includes('/rest/v1/plant_scans')){
      if(init?.method==='HEAD')return new Response(null,{headers:{'Content-Range':`0-0/${quota}`}});
      if(init?.method==='POST'){assert(JSON.parse(String(init.body)).gemini_model==='plantnet-v2/all','Recognition audit provider');return json({id:'33333333-3333-4333-8333-333333333333'});}
      if(init?.method==='PATCH'){stored=JSON.parse(String(init.body));return new Response(null,{status:204});}
    }
    if(url.startsWith('https://my-api.plantnet.org/v2/identify/all?')){
      plantnetCalls++;
      assert(init?.body instanceof FormData,'Pl@ntNet must receive image multipart');
      const form=init?.body as FormData;
      assert(form.get('images') instanceof Blob && form.get('organs')==='auto','Image and automatic organ detection');
      assert(new URL(url).searchParams.get('no-reject')==='false','Non-plant rejection enabled');
      return json(upstream,providerStatus);
    }
    if(url.startsWith('https://generativelanguage.googleapis.com/')){
      geminiCalls++;
      const body=JSON.parse(String(init?.body));
      assert(!JSON.stringify(body).includes('inlineData'),'Gemini must never receive the image');
      const names=JSON.parse(body.contents[0].parts[0].text);
      assert(names.every((p:any)=>Object.keys(p).sort().join(',')==='commonName,scientificName'),'Gemini receives names only, no confidence');
      return json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({plants:names.map((p:any)=>advice(p.scientificName))})}]}}]});
    }
    throw new Error('Unexpected request');
  };
  const request=(path=imagePath,auth=true)=>new Request('https://edge.test/',{method:'POST',headers:auth?{Authorization:'Bearer test-token'}:{},body:JSON.stringify({imagePath:path})});
  try{
    assert((await handleRequest(request(imagePath,false))).status===401,'Missing auth');
    assert((await handleRequest(request('other/scans/test.jpg'))).status===403,'Foreign image');
    quota=20;assert((await handleRequest(request())).status===429 && plantnetCalls===0,'Quota before providers');quota=0;
    const response=await handleRequest(request());const result=await response.json();
    assert(response.status===200 && plantnetCalls===1 && geminiCalls===1,'Both providers called in pipeline');
    assert(result.identification.commonName==='ซีลาจิเนลลา เคราส์เซียนา' && result.identification.confidence===.09,'Thai name, original Pl@ntNet confidence');
    assert(result.identification.scientificName==='Selaginella kraussiana' && result.identification.alternativeCandidates[0].confidence===.03,'Original species and alternatives');
    assert(stored.status==='uncertain' && stored.raw_response.careProvider==='gemini','Low confidence and care provenance');
    upstream={results:[]};const empty=await (await handleRequest(request())).json();assert(!empty.identification.isPlant && geminiCalls===1,'Non-plants skip Gemini');
    providerStatus=404;upstream={message:'Species not found'};assert(!(await (await handleRequest(request())).json()).identification.isPlant,'Provider non-plant rejection');
    providerStatus=429;assert((await handleRequest(request())).status===429 && stored.status==='failed','Provider quota recorded');
    providerStatus=200;upstream={results:[{score:2,species:{scientificNameWithoutAuthor:'Invalid'}}]};assert((await handleRequest(request())).status===502,'Invalid recognition rejected');
  }finally{globalThis.fetch=oldFetch;env.forEach((k,i)=>previous[i]===undefined?Deno.env.delete(k):Deno.env.set(k,previous[i]!));}
});

Deno.test('Gemini care: Thai required, species immutable, retries bounded and quota distinct',async()=>{
  const oldFetch=globalThis.fetch,oldKey=Deno.env.get('GEMINI_API_KEY');Deno.env.set('GEMINI_API_KEY','test-only');
  const original=normalizePlantnet({results:[recognition.results[0]]}).identification;
  let payload=advice(original.scientificName),status=200,transient=1,calls=0;
  globalThis.fetch=async()=>{calls++;return json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({plants:[payload]})}]}}]},transient-->0?503:status);};
  const fails=async(code:string)=>{let error:unknown;try{await enrichWithGemini(original);}catch(e){error=e;}assert(error instanceof GeminiCareError && error.code===code,code);};
  try{
    const result=await enrichWithGemini(original);assert(calls===2 && result.confidence===.09 && result.scientificName===original.scientificName,'Retry then immutable species/score');
    payload={...payload,commonName:'English only'};await fails('GEMINI_CARE_INVALID');
    payload={...advice(original.scientificName),scientificName:'Different species'};await fails('GEMINI_CARE_INVALID');
    payload={...advice(original.scientificName),temperatureMinC:40,temperatureMaxC:10};await fails('GEMINI_CARE_INVALID');
    status=429;await fails('GEMINI_CARE_RATE_LIMIT');
    calls=0;status=503;await fails('GEMINI_CARE_UNAVAILABLE');assert(calls===3,'Persistent retries bounded');
    Deno.env.delete('GEMINI_API_KEY');await fails('GEMINI_CARE_CONFIGURATION');
    assert(!(await enrichWithGemini(normalizePlantnet({results:[]}).identification)).isPlant,'Non-plant requires no Gemini key');
  }finally{globalThis.fetch=oldFetch;oldKey===undefined?Deno.env.delete('GEMINI_API_KEY'):Deno.env.set('GEMINI_API_KEY',oldKey);}
});

// Preserve provider normalization and failure coverage from develop in a separate scope.
{

const owner = '11111111-1111-4111-8111-111111111111';
const imagePath = `${owner}/scans/22222222-2222-4222-8222-222222222222.jpg`;
const sample = {results:[{score:.9,species:{scientificNameWithoutAuthor:'Monstera deliciosa',commonNames:['มอนสเตอร่า'],family:{scientificNameWithoutAuthor:'Araceae'}}}],version:'test-model'};
const assert = (condition: unknown, text: string) => { if (!condition) throw new Error(text); };
Deno.test('Pl@ntNet normalization: confidence order, distinct alternatives, unknown care and audit sanitization', () => {
  const data={...sample,query:{'api-key':'never-store-this'},results:[
    {score:.2,species:{scientificNameWithoutAuthor:'Other species',commonNames:[]}},
    ...sample.results,...sample.results,
  ]};
  const {identification,response}=normalizePlantnet(data);
  assert(identification.scientificName==='Monstera deliciosa' && identification.confidence===.9,'Top score selected');
  assert(identification.alternativeCandidates.length===1,'Duplicates removed');
  assert(identification.alternativeCandidates[0].commonName==='Other species','Scientific name fallback');
  assert(identification.sunlightRequirement==='unknown'&&identification.wateringIntervalDays===null,'No invented care');
  assert(!JSON.stringify(response).includes('never-store-this'),'Provider query and secrets stripped');
});
Deno.test('Edge handler: owner isolation, multipart images, non-plant, malformed result and provider failures', async () => {
  const originalFetch = globalThis.fetch;
  const env = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PLANTNET_API_KEY','GEMINI_API_KEY','GEMINI_CARE_MODEL'];
  const previous = env.map(k => Deno.env.get(k));
  Deno.env.set('SUPABASE_URL','https://test.supabase.co'); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY','test-only');
  Deno.env.set('PLANTNET_API_KEY','test-only'); Deno.env.set('GEMINI_API_KEY','test-only'); Deno.env.set('GEMINI_CARE_MODEL','test-care-model');
  let output: unknown = sample;
  let upstreamStatus = 200;
  let failed = false;
  let transientFailures = 0;
  let calls = 0;
  let storedStatus = '';
  let scanCount = 0;
  const json = (value: unknown, status = 200, headers={}) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json',...headers } });
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes('/auth/v1/user')) return json({ id: owner, aud: 'authenticated', role: 'authenticated', email: '' });
    if (url.includes('/storage/v1/object/')) return new Response(new Uint8Array([0xff,0xd8,0xff,0xd9]), { headers: { 'Content-Type': 'image/jpeg' } });
    if (url.includes('/rest/v1/plant_scans')) {
      if (init?.method === 'HEAD') return new Response(null, { headers: { 'Content-Range': `0-0/${scanCount}` } });
      if (init?.method === 'POST') {assert(String(init.body).includes('plantnet-v2/all'),'Provider recorded');return json({ id: '33333333-3333-4333-8333-333333333333' });}
      if (init?.method === 'PATCH') {const update=JSON.parse(String(init.body));failed=update.status==='failed';storedStatus=update.status;return new Response(null, { status: 204 }); }
    }
    if(url.startsWith('https://generativelanguage.googleapis.com/')){
      const body=JSON.parse(String(init?.body));
      const names=JSON.parse(body.contents[0].parts[0].text);
      assert(!body.contents[0].parts[0].inlineData,'Gemini receives botanical names, not photos');
      return json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({plants:names.map((plant:{scientificName:string})=>({scientificName:plant.scientificName,commonName:'มอนสเตอร่า',description:'ตรวจดินก่อนรดน้ำ วางในแสงรำไร',wateringIntervalDays:7,sunlightRequirement:'medium',temperatureMinC:18,temperatureMaxC:32,careDifficulty:'easy',warnings:['ระวังสัตว์เลี้ยงกัดใบ']}))})}]}}]});
    }
    if (url.startsWith('https://my-api.plantnet.org/v2/identify/all?')) {
      calls++;
      const endpoint=new URL(url);
      assert(endpoint.searchParams.get('api-key')==='test-only','Server key used');
      assert(endpoint.searchParams.get('lang')==='en','Supported provider language');
      assert(endpoint.searchParams.get('no-reject')==='false','Non-plant rejection enabled');
      assert(init?.body instanceof FormData,'Multipart upload required');
      const form=init?.body as FormData;
      assert(form.get('images') instanceof Blob && (form.get('images') as Blob).size===4,'JPEG bytes uploaded');
      assert(form.get('organs')==='auto','Automatic organ detection');
      if (transientFailures-- > 0) return json({}, 503);
      if(upstreamStatus===404)return json({message:'Species not found'},404);
      return json(output,upstreamStatus,upstreamStatus===429?{'Retry-After':'43'}:{});
    }
    throw new Error('Unexpected request');
  };
  const request = (path = imagePath, token = true) => new Request('https://edge.test/', { method: 'POST',
    headers: token ? { Authorization: 'Bearer test-token' } : {}, body: JSON.stringify({ imagePath: path }) });
  try {
    assert((await handleRequest(request(imagePath,false))).status === 401, 'Missing session rejected');
    assert((await handleRequest(request('another-user/scans/test.jpg'))).status === 403, 'Foreign path rejected');
    scanCount=20;
    assert((await handleRequest(request())).status===429 && calls===0,'User rate limit before provider call');
    scanCount=0;
    const result = await handleRequest(request());
    assert(result.status === 200 && (await result.json()).identification.scientificName==='Monstera deliciosa','Valid analysis normalized');
    transientFailures = 1; calls = 0;
    assert((await handleRequest(request())).status === 200 && calls === 2, 'Transient outage retried');
    upstreamStatus=404;
    const nonPlant=await (await handleRequest(request())).json();
    assert(!nonPlant.identification.isPlant && nonPlant.identification.scientificName==='' && storedStatus==='not_plant','Provider rejection cannot create plant');
    upstreamStatus=200;output={results:[]};
    assert(!(await (await handleRequest(request())).json()).identification.isPlant,'Empty results rejected');
    output={results:[{score:2,species:{scientificNameWithoutAuthor:'Invalid'}}]};failed=false;
    assert((await handleRequest(request())).status === 502 && failed, 'Malformed output records failed scan');
    upstreamStatus=503;failed=false;calls=0;
    const outage=await handleRequest(request());
    assert(outage.status===503 && failed && (await outage.json()).code==='PLANTNET_UNAVAILABLE' && calls===3,'Persistent retries bounded');
    upstreamStatus=429;calls=0;failed=false;
    const limited=await handleRequest(request());const body=await limited.json();
    assert(limited.status===429 && body.code==='PLANTNET_RATE_LIMIT' && body.retryAfterSeconds===43 && calls===1 && failed,'Quota not retried; safe retry message');
    upstreamStatus=403;
    const denied=await handleRequest(request());
    assert(denied.status===503 && (await denied.json()).code==='PLANTNET_CONFIGURATION','Provider key errors explained');
    upstreamStatus=400;
    assert((await handleRequest(request())).status===400,'Invalid image explained');
    assert((await handleRequest(new Request('https://edge.test/', { method: 'OPTIONS' }))).status===204,'CORS preflight');
  } finally {
    globalThis.fetch = originalFetch;
    env.forEach((key,i) => { if (previous[i] === undefined) Deno.env.delete(key); else Deno.env.set(key,previous[i]!); });
  }
});

Deno.test('Gemini care: Thai names, immutable species/scores, schema validation and quota errors', async()=>{
  const {enrichWithGemini,GeminiCareError}=await import('../_shared/gemini-care.ts');
  const originalFetch=globalThis.fetch;
  const previous=Deno.env.get('GEMINI_API_KEY');Deno.env.set('GEMINI_API_KEY','test-only');
  const {identification}=normalizePlantnet(sample);
  let payload={scientificName:'Monstera deliciosa',commonName:'มอนสเตอร่า',description:'ตรวจดินก่อนรดน้ำและวางแสงรำไร',wateringIntervalDays:7,sunlightRequirement:'medium',temperatureMinC:18,temperatureMaxC:32,careDifficulty:'easy',warnings:[]};
  let status=200;
  globalThis.fetch=async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({plants:[payload]})}]}}]}),{status});
  const expectError=async(code:string)=>{try{await enrichWithGemini(identification);throw new Error('Expected error');}catch(error){assert(error instanceof GeminiCareError && error.code===code,code);}};
  try{
    const result=await enrichWithGemini(identification);
    assert(result.commonName==='มอนสเตอร่า' && result.confidence===.9 && result.scientificName===identification.scientificName,'Thai care and original identification retained');
    payload={...payload,commonName:'Monstera'};await expectError('GEMINI_CARE_INVALID');
    payload={...payload,commonName:'มอนสเตอร่า',scientificName:'Different species'};await expectError('GEMINI_CARE_INVALID');
    payload={...payload,scientificName:'Monstera deliciosa',temperatureMinC:40,temperatureMaxC:10};await expectError('GEMINI_CARE_INVALID');
    status=429;await expectError('GEMINI_CARE_RATE_LIMIT');
    Deno.env.delete('GEMINI_API_KEY');await expectError('GEMINI_CARE_CONFIGURATION');
    assert(!(await enrichWithGemini(normalizePlantnet({results:[]}).identification)).isPlant,'Non-plants do not require Gemini');
  }finally{globalThis.fetch=originalFetch;if(previous===undefined)Deno.env.delete('GEMINI_API_KEY');else Deno.env.set('GEMINI_API_KEY',previous);}
});
}
