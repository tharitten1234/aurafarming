import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localizePlantName} from '../supabase/functions/_shared/thai-plant-names';
test('Thai names match exact species, preserve confidence and remove only obsolete missing-name warnings',()=>{
 for(const [scientificName,expected] of [['Ocimum tenuiflorum','กะเพรา'],['Ocimum sanctum','กะเพรา'],['Ocimum americanum','แมงลัก'],['Ocimum basilicum','โหระพาอิตาเลียน']]){
  const candidate={scientificName,commonName:'พืชที่ยังไม่มีชื่อไทยในฐานข้อมูล',confidence:.79,warnings:['ยังไม่มีชื่อไทยที่ยืนยันได้ โปรดอ้างอิงชื่อวิทยาศาสตร์','ยังไม่มีข้อมูลดูแลเฉพาะชนิดจาก Perenual']};
  const result=localizePlantName(candidate);
  assert.equal(result.commonName,expected);assert.equal(result.scientificName,scientificName);assert.equal(result.confidence,.79);
  assert.deepEqual(result.warnings,['ยังไม่มีข้อมูลดูแลเฉพาะชนิดจาก Perenual']);assert.equal(candidate.warnings.length,2);
 }
 const unknown={scientificName:'Ocimum unknown',commonName:'Unknown',warnings:[]};assert.equal(localizePlantName(unknown),unknown);
});
