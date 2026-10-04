import type { PlantCandidate } from '../types';
import type { PlantSpeciesData } from '../data/plantDatabase';
import {careWarnings} from '../../supabase/functions/_shared/care-sources';
export function catalogCandidate(p: PlantSpeciesData): PlantCandidate {
 return {commonName:p.thaiName,scientificName:p.scientificName,category:'catalog',confidence:0,description:p.wateringGuide,
 wateringIntervalDays:null,sunlightRequirement:p.optimalLight==='แสงน้อย'?'low':p.optimalLight==='แสงมาก'?'high':'medium',
 temperatureMinC:null,temperatureMaxC:null,careDifficulty:'unknown',warnings:careWarnings(p.scientificName,[p.cautions])};
}
