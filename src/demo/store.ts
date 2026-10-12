import type {Plant,Task,TimelinePhoto,UserProfile,PlantCandidate,ScanResult,PlacementConfig} from '../types';
import {calculatePlantMatchScore,lightLabels,locationLabels} from '../services/auraScore';
import {emptyProfile} from '../services/profile';
import {missionCare,bangkokDate} from '../services/careRules';

export const isDemo = typeof window!=='undefined' && ['1','offline'].includes(new URLSearchParams(window.location.search).get('demo')??'');
export const isOfflineDemo = isDemo && new URLSearchParams(window.location.search).get('demo')==='offline';
const KEY='aurafarming.presentation.v1';
const rows = [
 ['monstera','มอนสเตอร่า','Monstera deliciosa','medium','ตรวจดินชั้นบนให้แห้งก่อนรดน้ำ ใช้ดินระบายน้ำดีและแสงสว่างที่กรองแล้ว'],
 ['pothos','พลูด่าง','Epipremnum aureum','medium','ใช้แสงสว่างกรองแล้วและดินระบายน้ำดี ตรวจความชื้นก่อนให้น้ำ ไม่ปล่อยน้ำขัง'],
 ['snake','ลิ้นมังกร','Dracaena trifasciata','medium','วางในบริเวณสว่าง รอวัสดุปลูกแห้งก่อนรดน้ำ ใช้กระถางระบายน้ำดี'],
 ['basil','โหระพา','Ocimum basilicum','high','ให้แสงเพียงพอและอากาศอบอุ่น ตรวจดินไม่ให้แห้งจัดหรือแฉะ ปรับน้ำตามสภาพจริง'],
 ['cactus','กระบองเพชรถังทอง','Echinocactus grusonii','high','ให้แสงสว่างมากและวัสดุปลูกโปร่ง รอวัสดุปลูกแห้งก่อนรดน้ำ ระวังหนาม'],
] as const;
export const demoSpecies=rows.map(([id,name,scientificName,light,description])=>({id,image:`/demo/${id}.svg`,candidate:{commonName:name,scientificName,category:'demo',confidence:0,description:`ข้อมูลสาธิตที่เตรียมไว้: ${description}`,wateringIntervalDays:null,sunlightRequirement:light,temperatureMinC:null,temperatureMaxC:null,careDifficulty:'unknown',warnings:['ข้อมูลสาธิต ไม่ใช่ผลวิเคราะห์ภาพสด','ตรวจสภาพต้นไม้และดินจริงก่อนดูแล']} satisfies PlantCandidate}));
type DemoTask=Task & {state:'pending'|'completed'|'skipped'|'postponed';due?:number};
type State={plants:Plant[];tasks:DemoTask[];photos:TimelinePhoto[];user:UserProfile;bonus:boolean;lastCare?:string;moisture:Record<string,string>};
function makePlant(candidate:PlantCandidate,config:PlacementConfig,image:string,id:string=crypto.randomUUID()):Plant {
 const score=calculatePlantMatchScore(candidate,config).totalScore;
 return {id,name:candidate.commonName,nickname:candidate.commonName,scientificName:candidate.scientificName,daysPlanted:1,auraScore:score,plantMatchScore:score,source:'manual',location:locationLabels[config.location],sunlight:lightLabels[config.light],image,pixelSprite:/cactus|grusonii/.test(candidate.scientificName)?'/plant3_thumb.png':'/plant1_thumb.png',potType:'terracotta',features:[lightLabels[candidate.sunlightRequirement],'ตรวจดินก่อนรดน้ำ'],careStatus:'good',lastWatered:'ยังไม่มีบันทึก',identification:{...candidate,isPlant:true,alternativeCandidates:[]},careHistory:[],createdAt:new Date().toISOString()};
}
function missions(plant:Plant):DemoTask[]{return (['moisture','wipe','photo'] as const).map(kind=>({id:crypto.randomUUID(),plantId:plant.id,plantName:plant.nickname,plantSpecies:plant.name,kind,title:kind==='moisture'?'ตรวจความชื้นดิน':kind==='wipe'?'ตรวจใบและแมลง':'บันทึกภาพต้นไม้',reward:`+${kind==='photo'?15:10} Aura`,rewardPoints:kind==='photo'?15:10,icon:kind==='moisture'?'💧':kind==='wipe'?'🍃':'📷',iconBg:'bg-blue-100',isCompleted:false,actionText:'ดูภารกิจ',statusText:'แตะเพื่อดู',state:'pending',...missionCare(kind,plant.identification!)}));}
function seed():State{
 const plants=demoSpecies.map(s=>makePlant(s.candidate,{location:s.candidate.sunlightRequirement==='high'?'balcony':'window',light:s.candidate.sunlightRequirement as PlacementConfig['light']},s.image,s.id));
 return {plants,tasks:plants.flatMap(missions),photos:plants.map((p,i)=>({id:`sample-${i}`,plantId:p.id,date:new Date().toLocaleDateString('th-TH'),photoUrl:p.image,caption:'ภาพประกอบตัวอย่างสำหรับสาธิต ไม่ใช่ภาพการเติบโตจริง',badgeLabel:'ตัวอย่าง',badgeIcon:'🌱',badgeColor:'bg-green-100',plantMatchScore:p.auraScore,isLatest:true})),user:{...emptyProfile,name:'สวนสาธิต AuraFarming',farmName:'สวนสาธิต AuraFarming',plantsAdded:5,photosRecorded:5,plantCount:5},bonus:false,moisture:{}};
}
let state:State|undefined;
function get(){if(!state){try{state=JSON.parse(localStorage.getItem(KEY)??'null')??seed();}catch{state=seed();}}return state!;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(get()));}catch{/* Keep this session playable when local storage is full. */}}
function plant(id:string){const p=get().plants.find(p=>p.id===id);if(!p)throw new Error('ไม่พบพืชสาธิต');return p;}
function complete(task:DemoTask){if(task.state!=='pending')return;task.state='completed';task.isCompleted=true;task.statusText='สำเร็จแล้ว';get().user.auraScore+=task.rewardPoints;get().user.completedTasksCount++;if(!get().bonus&&get().tasks.every(t=>t.isCompleted)){get().bonus=true;get().user.auraScore+=30;}}
function touch(){const day=bangkokDate();if(get().lastCare!==day){get().lastCare=day;get().user.daysStreak++;get().user.bestCareStreak=Math.max(get().user.bestCareStreak??0,get().user.daysStreak);}persist();}
export const demo={
 reset(){state=seed();persist();},
 async listPlants(){return structuredClone(get().plants);},
 async listMissions(){for(const t of get().tasks)if(t.state==='postponed'&&t.due!<=Date.now()){t.state='pending';t.statusText='แตะเพื่อดู';}return structuredClone(get().tasks);},
 async listGrowthLogs(){return structuredClone(get().photos);},
 async loadProfile(_plants:number,_tasks:number){const u=get().user;return {...u,plantCount:get().plants.length,level:Math.floor(u.auraScore/150)+1,exp:u.auraScore%150,maxExp:150};},
 async addManualPlant(name:string,nickname:string,config:PlacementConfig,scientificName?:string){const species=demoSpecies.find(s=>s.candidate.scientificName===scientificName||s.candidate.commonName===name);if(!species)throw new Error('โหมดสาธิตรองรับพืช 5 ชนิดที่เตรียมไว้');const p=makePlant(species.candidate,config,species.image);p.nickname=nickname;get().plants.push(p);get().tasks.push(...missions(p));get().user.plantsAdded=(get().user.plantsAdded??0)+1;get().user.auraScore+=15;persist();},
 async savePlant(scan:ScanResult,candidate:PlantCandidate,config:PlacementConfig){const p=makePlant(candidate,config,scan.image);get().plants.push(p);get().tasks.push(...missions(p));get().user.plantsAdded=(get().user.plantsAdded??0)+1;get().user.auraScore+=20;persist();},
 async renamePlant(id:string,name:string){plant(id).nickname=name;for(const t of get().tasks.filter(t=>t.plantId===id))t.plantName=name;persist();},
 async movePlant(id:string,location:string,sunlight:string){const p=plant(id);p.location=location;p.sunlight=sunlight;const config={location:(Object.entries(locationLabels).find(([,v])=>v===location)?.[0]??'window') as PlacementConfig['location'],light:(/น้อย/.test(sunlight)?'low':/มาก/.test(sunlight)?'high':'medium') as PlacementConfig['light']};p.auraScore=p.plantMatchScore=calculatePlantMatchScore(p.identification!,config).totalScore;persist();},
 async archivePlant(id:string){get().plants=get().plants.filter(p=>p.id!==id);get().tasks=get().tasks.filter(t=>t.plantId!==id);persist();},
 async recordCare(id:string,kind:'water'|'dry'|'moist'|'wet'){const p=plant(id);const now=new Date().toISOString();if(kind==='water'){if(p.lastWateredAt&&bangkokDate(new Date(p.lastWateredAt))===bangkokDate())return;if(get().moisture[id]!=='dry'||!p.lastCheckedAt||Date.now()-Date.parse(p.lastCheckedAt)>86400000)throw new Error('กรุณาตรวจดินก่อนรดน้ำ หากดินยังชื้นให้งดรดน้ำ');p.lastWateredAt=now;p.lastWatered='วันนี้';p.careStatus='happy';}else{get().moisture[id]=kind;p.lastCheckedAt=now;p.lastCheckedMoisture='วันนี้';p.careStatus=kind==='dry'?'needs-water':'good';const t=get().tasks.find(t=>t.plantId===id&&t.kind==='moisture');if(t)complete(t);}p.careHistory!.unshift({id:crypto.randomUUID(),date:'วันนี้',label:kind==='water'?'รดน้ำ':`ตรวจดิน: ${kind==='dry'?'แห้ง':kind==='moist'?'ชื้น':'แฉะ'}`});touch();},
 async updateMission(id:string,status:'completed'|'postponed'|'skipped'){const t=get().tasks.find(t=>t.id===id);if(!t||t.isCompleted)return;if(status==='completed'){if(t.state!=='pending')throw new Error('ภารกิจนี้ถูกข้ามหรือยังไม่ถึงกำหนด');if(t.kind==='moisture'&&!plant(t.plantId).lastCheckedAt)throw new Error('กรุณาตรวจความชื้นดินก่อน');if(t.kind==='photo'&&!get().photos.some(p=>p.plantId===t.plantId&&!p.id.startsWith('sample-')))throw new Error('กรุณาบันทึกภาพต้นไม้ก่อน');complete(t);touch();}else{t.state=status;t.due=Date.now()+86400000;t.statusText=status==='skipped'?'ข้ามสัปดาห์นี้':'เลื่อนถึงวันพรุ่งนี้';}persist();},
 async addGrowthLog(id:string,file:File,note:string,badge:string,activity='',notes=''){const p=plant(id);const image=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('อ่านภาพไม่ได้'));reader.readAsDataURL(file);});get().photos.filter(x=>x.plantId===id).forEach(x=>x.isLatest=false);get().photos.unshift({id:crypto.randomUUID(),plantId:id,date:'วันนี้',photoUrl:image,caption:note,badgeLabel:badge,badgeIcon:'📷',badgeColor:'bg-green-100',careActivity:activity,notes,isLatest:true,plantMatchScore:p.plantMatchScore});get().user.photosRecorded=(get().user.photosRecorded??0)+1;const t=get().tasks.find(t=>t.plantId===id&&t.kind==='photo');if(t)complete(t);touch();},
 async updateDisplayName(name:string){get().user.name=get().user.farmName=name;persist();},
};
