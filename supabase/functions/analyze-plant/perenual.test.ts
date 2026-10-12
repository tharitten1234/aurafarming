import { enrichWithPerenual } from '../_shared/perenual-care.ts';
import { normalizePlantnet } from '../_shared/plantnet.ts';
Deno.test('Perenual: exact species, unknown care, quota and unchanged recognition', async()=>{
 const oldFetch=globalThis.fetch, oldKey=Deno.env.get('PERENUAL_API_KEY');
 Deno.env.set('PERENUAL_API_KEY','test-only');
 const identify=(name:string)=>normalizePlantnet({results:[{score:.42,species:{scientificNameWithoutAuthor:name,commonNames:[]}}]}).identification;
 try {
  globalThis.fetch=async()=>new Response(JSON.stringify({data:[{id:1,scientific_name:['Wrong species']}]}));
  const result=await enrichWithPerenual(identify('Exactus testus'));
  if(result.scientificName!=='Exactus testus'||result.confidence!==.42||result.sunlightRequirement!=='unknown'||result.wateringIntervalDays!==null)throw new Error('Recognition or unknown care changed');
  globalThis.fetch=async()=>new Response('quota',{status:429});
  const limited=await enrichWithPerenual(identify('Quota testus'));
  if(limited.confidence!==.42||limited.scientificName!=='Quota testus'||!limited.description.includes('ไม่พร้อม'))throw new Error('Care outage must preserve recognition');
  Deno.env.delete('PERENUAL_API_KEY');
  if((await enrichWithPerenual(normalizePlantnet({results:[]}).identification)).isPlant)throw new Error('Nonplant changed');
 }finally{globalThis.fetch=oldFetch; oldKey===undefined?Deno.env.delete('PERENUAL_API_KEY'):Deno.env.set('PERENUAL_API_KEY',oldKey);}
});
