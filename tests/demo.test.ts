import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';

test('Demo: five plants, no network, care, rewards, photos, archive and reset',async()=>{
 const window=new Window({url:'http://localhost:3000/?demo=1'});
 Object.assign(globalThis,{window,localStorage:window.localStorage,FileReader:window.FileReader});
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async()=>{throw new Error('Demo must not call the network');};
 try{
  const {demo,demoSpecies,isDemo}=await import('../src/demo/store');
  assert.equal(isDemo,true);demo.reset();
  assert.equal((await demo.listPlants()).length,5);
  assert.equal(demoSpecies.length,5);
  const id=(await demo.listPlants())[0].id;
  await assert.rejects(demo.recordCare(id,'water'),/ตรวจดิน/);
  await demo.recordCare(id,'moist');
  assert.equal((await demo.loadProfile(5,0)).auraScore,10);
  await demo.recordCare(id,'dry');await demo.recordCare(id,'water');
  const profile=await demo.loadProfile(5,0);
  await demo.recordCare(id,'water');assert.deepEqual(await demo.loadProfile(5,0),profile);
  const file=new window.File(['example'],'photo.jpg',{type:'image/jpeg'});
  await demo.addGrowthLog(id,file as unknown as File,'สาธิต','ภาพใหม่');
  assert.equal((await demo.loadProfile(5,0)).auraScore,25);
  await demo.addGrowthLog(id,file as unknown as File,'อีกภาพ','ภาพใหม่');
  assert.equal((await demo.loadProfile(5,0)).auraScore,25);
  await demo.renamePlant(id,'น้องสาธิต');await demo.movePlant(id,'ในห้อง','แสงน้อย');
  assert.equal((await demo.listPlants())[0].nickname,'น้องสาธิต');
  assert.ok((await demo.listPlants())[0].plantMatchScore<100);
  const task=(await demo.listMissions()).find(t=>t.kind==='wipe'&&t.plantId===id)!;
  await demo.updateMission(task.id,'postponed');await assert.rejects(demo.updateMission(task.id,'completed'),/กำหนด/);
  for(const p of await demo.listPlants()){
   await demo.recordCare(p.id,'moist');
   await demo.addGrowthLog(p.id,file as unknown as File,'สาธิต','ภาพใหม่');
   for(const t of await demo.listMissions())if(t.plantId===p.id&&t.kind==='wipe'&&t.id!==task.id)await demo.updateMission(t.id,'completed');
  }
  // Postponed task must not earn a weekly bonus early.
  assert.equal((await demo.loadProfile(5,0)).auraScore,165);
  assert.ok(localStorage.getItem('aurafarming.presentation.v1'));
  await demo.archivePlant(id);assert.equal((await demo.listPlants()).length,4);
  assert.equal((await demo.loadProfile(4,0)).plantsAdded,5);
  demo.reset();assert.equal((await demo.listPlants()).length,5);assert.equal((await demo.loadProfile(5,0)).auraScore,0);
 }finally{globalThis.fetch=oldFetch;await window.happyDOM.close();}
});
