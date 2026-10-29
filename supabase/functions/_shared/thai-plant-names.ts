// Established Thai names from the manual catalog and the sources in docs/THAI-PLANT-NAMES.md.
export const thaiPlantNames: Record<string,string> = {
  "monstera deliciosa": "มอนสเตอร่า",
  "epipremnum aureum": "พลูด่าง",
  "sansevieria trifasciata": "ลิ้นมังกร",
  "ficus elastica": "ยางอินเดีย",
  "zamioculcas zamiifolia": "กวักมรกต",
  "spathiphyllum wallisii": "เดหลี",
  "calathea orbifolia": "คล้าใบตอง",
  "dieffenbachia seguine": "สาวน้อยประแป้ง",
  "jasminum sambac": "มะลิซ้อน",
  "echinopsis calochlora": "กระบองเพชร",
  "ocimum basilicum": "โหระพาอิตาเลียน",
  "ocimum tenuiflorum": "กะเพรา",
  "ocimum sanctum": "กะเพรา",
  "ocimum americanum": "แมงลัก",
  "ocimum africanum": "แมงลัก",
  "dracaena trifasciata": "ลิ้นมังกร",
  "ficus lyrata": "ไทรใบสัก",
  "aloe barbadensis miller": "ว่านหางจระเข้",
  "nephrolepis exaltata": "เฟิร์นบอสตัน",
  "thaumatophyllum xanadu": "ซานาดู"
};

export function localizePlantName<T extends {scientificName:string;commonName:string;warnings:string[]}>(candidate:T):T {
  const name=thaiPlantNames[candidate.scientificName.trim().replace(/\s+/g,' ').toLowerCase()];
  if(!name)return candidate;
  return {...candidate,commonName:name,warnings:candidate.warnings.filter(w=>!w.startsWith('ยังไม่มีชื่อไทยที่ยืนยันได้'))};
}
