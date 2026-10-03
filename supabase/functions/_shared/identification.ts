import { z } from 'zod';

// Shared validation on the server and browser; confidence is an AI estimate.
export const candidateSchema = z.object({
  commonName: z.string().max(160),
  scientificName: z.string().max(200),
  category: z.string().max(100),
  confidence: z.number().min(0).max(1),
  description: z.string().max(2000),
  wateringIntervalDays: z.number().int().min(1).max(90).nullable(),
  sunlightRequirement: z.enum(['low', 'medium', 'high', 'unknown']),
  temperatureMinC: z.number().min(-30).max(60).nullable(),
  temperatureMaxC: z.number().min(-30).max(60).nullable(),
  careDifficulty: z.enum(['easy', 'moderate', 'hard', 'unknown']),
  warnings: z.array(z.string().max(500)).max(10),
}).refine(c => c.temperatureMinC === null || c.temperatureMaxC === null ||
  c.temperatureMinC <= c.temperatureMaxC, 'Invalid temperature range');
export const identificationSchema = z.object({
  isPlant: z.boolean(),
  ...candidateSchema.shape,
  alternativeCandidates: z.array(candidateSchema).max(4),
}).refine(c => c.temperatureMinC === null || c.temperatureMaxC === null ||
  c.temperatureMinC <= c.temperatureMaxC, 'Invalid temperature range');
export type PlantCandidate = z.infer<typeof candidateSchema>;
export type PlantIdentification = z.infer<typeof identificationSchema>;

export function canSaveCandidate(result: PlantIdentification, candidate: PlantCandidate) {
  return result.isPlant && candidate.commonName.trim().length > 0 &&
    candidate.scientificName.trim().length > 0;
}
