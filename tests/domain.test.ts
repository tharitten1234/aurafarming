import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAuraScore } from '../src/services/auraScore';
import { identificationSchema, canSaveCandidate } from '../supabase/functions/_shared/identification';

export const sampleIdentification = {
  isPlant: true, commonName: 'มอนสเตอร่า', scientificName: 'Monstera deliciosa', category: 'foliage',
  confidence: 0.85, description: 'พืชใบ', wateringIntervalDays: 7, sunlightRequirement: 'medium' as const,
  temperatureMinC: 18, temperatureMaxC: 32, careDifficulty: 'easy' as const, warnings: ['ระวังสัตว์เลี้ยง'], alternativeCandidates: [],
};
test('AuraScore is deterministic, bounded and species-dependent for every input', () => {
  for (const required of ['low','medium','high','unknown'] as const)
    for (const location of ['indoor','window','balcony','porch'] as const)
      for (const light of ['low','medium','high'] as const) {
        const score = calculateAuraScore({ sunlightRequirement: required }, { location, light });
        assert.deepEqual(score, calculateAuraScore({ sunlightRequirement: required }, { location, light }));
        assert.ok(score.totalScore >= 0 && score.totalScore <= 100);
        assert.equal(score.totalScore, score.lightScore + score.posScore);
        assert.equal(score.reasons.length, 2);
      }
  assert.equal(calculateAuraScore({ sunlightRequirement: 'high' }, { location: 'balcony', light: 'high' }).totalScore, 100);
  assert.ok(calculateAuraScore({ sunlightRequirement: 'low' }, { location: 'balcony', light: 'high' }).totalScore < 40);
});
test('Malformed AI results and uncalibrated/out-of-range confidence are rejected', () => {
  assert.ok(identificationSchema.safeParse(sampleIdentification).success);
  for (const patch of [{ confidence: 92 }, { wateringIntervalDays: -1 }, { sunlightRequirement: 'sunny' },
    { temperatureMinC: 50, temperatureMaxC: 10 }, { warnings: 'none' }])
    assert.equal(identificationSchema.safeParse({ ...sampleIdentification, ...patch }).success, false);
});
test('Non-plants and unnamed species cannot become plant records', () => {
  assert.ok(canSaveCandidate(sampleIdentification, sampleIdentification));
  assert.equal(canSaveCandidate({ ...sampleIdentification, isPlant: false }, sampleIdentification), false);
  assert.equal(canSaveCandidate(sampleIdentification, { ...sampleIdentification, scientificName: '' }), false);
});
