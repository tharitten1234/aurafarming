// Curated facts, not citations invented by a model. Coverage is intentionally explicit.
export const careReferences={
  watering:'https://www.rhs.org.uk/container-gardening/how-to-water-containers',
  monstera:'https://plants.ces.ncsu.edu/plants/monstera-deliciosa/',
  monsteraToxicity:'https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/swiss-cheese-plant',
};
export const toxicityClaim=/พิษ|รับประทาน|กินได้|ปลอดภัยต่อ|สัตว์เลี้ยง|toxic|edible|pet\b/i;
export function careWarnings(scientificName:string,warnings:string[]) {
  const toxicity=scientificName.trim().toLowerCase()==='monstera deliciosa'
    ? 'ข้อมูลความเป็นพิษ: เป็นพิษต่อสุนัขและแมว หลีกเลี่ยงการกัดกิน (อ้างอิง ASPCA)'
    : 'ข้อมูลความเป็นพิษ: ยังไม่มีข้อมูลเพียงพอ';
  return [toxicity,...warnings.filter(w=>!toxicityClaim.test(w)).slice(0,9)];
}
export const verifiedCareContext=`General container watering: check each pot's soil moisture before deciding to water. Reference: ${careReferences.watering}.
For exact Monstera deliciosa only: moderate indirect light; allow the upper part of the potting mix to dry between watering; wipe dust gently when needed. Reference: ${careReferences.monstera}.
These references do not establish care or toxicity facts for any other species. All other species-specific guidance is AI advice, not verified reference data.`;
