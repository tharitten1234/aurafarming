import {enrichWithDataset} from '../supabase/functions/_shared/dataset-care';
import {normalizePlantnet} from '../supabase/functions/_shared/plantnet';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
test('Demo dataset: seeded five species, service-only access, exact matches and original AI scores',async()=>{
 const pg=new PGlite();
 try {
  await pg.exec('create role anon;create role authenticated;create role service_role bypassrls;');
  await pg.exec(await readFile('supabase/migrations/20261012081605_demo_plant_care_dataset.sql','utf8'));
  const rows=(await pg.query('select scientific_name,aliases,care from public.demo_plant_care')).rows;
  assert.equal(rows.length,5);
  assert.equal((await pg.query<{allowed:boolean}>("select has_table_privilege('authenticated','public.demo_plant_care','SELECT') as allowed")).rows[0].allowed,false);
  const original=normalizePlantnet({results:[{score:.09,species:{scientificNameWithoutAuthor:'Monstera deliciosa',commonNames:['Monstera']}},{score:.03,species:{scientificNameWithoutAuthor:'Unknown species',commonNames:['Unknown']}}]}).identification;
  const result=enrichWithDataset(original,rows);
  assert.equal(result.confidence,.09);assert.equal(result.scientificName,original.scientificName);
  assert.equal(result.commonName,'มอนสเตอร่า');assert.equal(result.sunlightRequirement,'medium');
  assert.equal(result.alternativeCandidates[0].confidence,.03);assert.equal(result.alternativeCandidates[0].sunlightRequirement,'unknown');
  assert.match(result.alternativeCandidates[0].description,/ยังไม่มีข้อมูล/);
  const alias=normalizePlantnet({results:[{score:.9,species:{scientificNameWithoutAuthor:'Sansevieria trifasciata'}}]}).identification;
  assert.equal(enrichWithDataset(alias,rows).scientificName,'Sansevieria trifasciata');
  assert.equal(enrichWithDataset(alias,rows).commonName,'ลิ้นมังกร');
 }finally{await pg.close();}
});
