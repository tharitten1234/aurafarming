export interface PlantSpeciesData {
  id: string;
  thaiName: string;
  englishName: string;
  scientificName: string;
  optimalLight: 'แสงน้อย' | 'แสงรำไร' | 'แสงมาก';
  optimalLocations: Array<'ในห้อง' | 'ริมหน้าต่าง' | 'ระเบียง' | 'หน้าบ้าน'>;
  wateringGuide: string;
  careMissions: string[];
  cautions: string;
  features: string[];
  defaultImage: string;
}

export const PLANT_DATABASE: PlantSpeciesData[] = [
  {
    id: 'monstera',
    thaiName: 'มอนสเตอร่า',
    englishName: 'Monstera / Swiss Cheese Plant',
    scientificName: 'Monstera deliciosa',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ริมหน้าต่าง', 'ในห้อง'],
    wateringGuide: 'รดน้ำเมื่อผิวดินชั้นบน 1-2 นิ้วแห้งสนิท สัปดาห์ละ 1-2 ครั้ง ห้ามรดน้ำทุกวันหรือปล่อยให้น้ำขัง',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดละอองฝุ่นบนใบ', 'หมุนกระถางรับแสง', 'ตรวจแมลงใต้ใบ', 'ถ่ายภาพติดตามการเติบโต'],
    cautions: 'ห้ามโดนแดดตรงจัดช่วงบ่ายเพราะใบจะไหม้เกรียม และใบมีสารแคลเซียมออกซาเลตควรระวังสัตว์เลี้ยงกัดแทะ',
    features: ['พืชฟอกอากาศยอดนิยม', 'ใบฉลุสวยงามเป็นเอกลักษณ์', 'ทนทาน เลี้ยงง่าย'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABSs8kAI1uu-eBbxhon4G2Tdtc1npTSpQQLmHJLIgPRl5bMijAY-YnkSlYFx8yMG75F-Pqm334qhNS-3S0s6kyMkj76oX_smqepnKk6VDxfsMsM-i2cE7ew1R2v4IW9VAnlb9MYKZmTEWsP4U07cEwhlXLNb_pXdDeP4l445Xkb_gZtYF5IrmB-ICUiL-hJKnCYNlMoOE7hapwNuWV0UQYvGsia-5aWUTqLz86d-s74Iu0mv64IZRX',
  },
  {
    id: 'golden-pothos',
    thaiName: 'พลูด่าง',
    englishName: 'Golden Pothos / Devil\'s Ivy',
    scientificName: 'Epipremnum aureum',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง'],
    wateringGuide: 'รดน้ำเมื่อดินแห้ง 2-3 วันครั้ง หรือเลี้ยงในแจกันน้ำได้ ห้ามรดน้ำทุกวันจนดินแฉะเกินไป',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดผิวใบเลื้อย', 'ตัดแต่งใบเหลือง', 'ถ่ายภาพติดตามการเติบโต'],
    cautions: 'ทนทานสูงมากแต่ห้ามวางตากแดดบ่ายจัดเพราะใบจะซีดไหม้ มีพิษอ่อนๆ ต่อน้องหมาและน้องแมวหากเคี้ยวกลืน',
    features: ['ดูดซับสารพิษและฟอร์มาลดีไฮด์', 'ทนทาน ปรับตัวเก่ง', 'ปลูกได้ทั้งดินและน้ำ'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2tHGchDbIE-6jtprLmM7KVK2CI89NK1DLxo21kEASp3LRaUYKnq9kaJn_QjIprnPgTUej877q9rPox90pS5kdNQmiHfM1aJ1i_MOgSEsKbE43Yfe_Pcpvpj26_cbX_IXK0E77N7RhxLNcT2O0gvxb1VDpu3-snj6GtFEQG8WSrKKZlOs48khLj32gvA4nTd8ZL-B4aYV-bXtQugZgOFqqAGbkfStAVxTHt0TE__WlBbvLvegBmCpr',
  },
  {
    id: 'snake-plant',
    thaiName: 'ลิ้นมังกร',
    englishName: 'Snake Plant / Mother-in-law\'s Tongue',
    scientificName: 'Sansevieria trifasciata',
    optimalLight: 'แสงน้อย',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง', 'ระเบียง'],
    wateringGuide: 'รดน้ำสัปดาห์ละ 1 ครั้ง หรือเมื่อดินแห้งสนิทเท่านั้น ห้ามรดน้ำทุกวันเด็ดขาดเพราะโคนต้นจะเน่าตาย',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดฝุ่นบนใบตั้งตรง', 'ตรวจโคนต้นไม่ให้แฉะ', 'ถ่ายภาพติดตามการเติบโต'],
    cautions: 'กลัวน้ำขังและความชื้นสะสมมากที่สุด ห้ามเทน้ำลงใจกลางพุ่มใบโดยตรง',
    features: ['คายออกซิเจนเวลากลางคืน เหมาะตั้งในห้องนอน', 'ทนแล้งยอดเยี่ยม', 'กรองฝุ่นและมลพิษ'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjoip1rOb930dBKNdIMD3btA2coSkVph3fyfBiqtN2vG5pq7KixjUABQHxvJqjk6-hGPXk1E8GJWxJ3YPY2GxpjjDY-tI2m82LT2mDW5ddqBprLteXlg4Rv9EC2E3uV_Mk2aLscYk2LhrIi6p2xaok_JLvqQJdpfyuyZ6msOBFKbqwyo7cPgn0EOq6kW-Or9FurYV6ZgNSQddqYcmL9wwwRwb_rOONTwMZ7jqWv48_VNk3rjw0yCIe',
  },
  {
    id: 'rubber-tree',
    thaiName: 'ยางอินเดีย',
    englishName: 'Rubber Tree',
    scientificName: 'Ficus elastica',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ริมหน้าต่าง', 'ระเบียง'],
    wateringGuide: 'รดน้ำเมื่อผิวดินแห้งลงไป 1 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง และปล่อยให้น้ำไหลระบายออกจนหมด',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดใบมันเงาด้วยผ้าหมาด', 'หมุนกระถาง 90 องศา', 'ตรวจไรแดง'],
    cautions: 'ใบหนาดักฝุ่นได้ดีจึงต้องหมั่นเช็ดใบ และไม่ชอบการย้ายตำแหน่งวางบ่อยๆ เพราะจะทิ้งใบ',
    features: ['ใบหนามันเงาพรีเมียม', 'ดักจับฝุ่นละอองดีเยี่ยม', 'ฟอกอากาศในคอนโด'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVT8JOuzI_y9UrD9kJ155pdrB5c3pq6xSoK1-EXSZX1Diyds-f-R8SMZHqx-kPxji8Tcv9g3CcJsFHZn50zw9xhbNYFD0_wVF1NLaSuk6wswNyQ9gOQe38pZW6O5BLgM1-WvSCJ4KLGnbuOusAjuHxLQzBpZfHorpZAS7HlQS6EmeZwXBwmAOL37yrQZ_PyhwrmszNvlFK5K5r_vgEJnMhn0tJzsGXzFaNGnt0P8cUaN96sLINlhVd',
  },
  {
    id: 'zz-plant',
    thaiName: 'กวักมรกต',
    englishName: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    optimalLight: 'แสงน้อย',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง'],
    wateringGuide: 'รดน้ำ 10-14 วันต่อครั้ง เมื่อดินแห้งสนิททั้งกระถาง มีหัวสะสมน้ำใต้ดินจึงทนแล้งได้สูงมาก',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดใบมรกตให้เงาแวววาว', 'ตรวจความแน่นของหัวใต้ดิน', 'ถ่ายภาพติดตามการเติบโต'],
    cautions: 'การรดน้ำบ่อยเกินไปคือสาเหตุอันดับ 1 ที่ทำให้หัวและก้านเน่าตาย',
    features: ['ไม้มงคลเรียกทรัพย์เข้าบ้าน', 'ทนในที่แสงน้อยและห้องแอร์', 'ดูแลง่ายมาก'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABSs8kAI1uu-eBbxhon4G2Tdtc1npTSpQQLmHJLIgPRl5bMijAY-YnkSlYFx8yMG75F-Pqm334qhNS-3S0s6kyMkj76oX_smqepnKk6VDxfsMsM-i2cE7ew1R2v4IW9VAnlb9MYKZmTEWsP4U07cEwhlXLNb_pXdDeP4l445Xkb_gZtYF5IrmB-ICUiL-hJKnCYNlMoOE7hapwNuWV0UQYvGsia-5aWUTqLz86d-s74Iu0mv64IZRX',
  },
  {
    id: 'peace-lily',
    thaiName: 'เดหลี',
    englishName: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง'],
    wateringGuide: 'ชอบดินชื้นปานกลาง รดน้ำเมื่อผิวดินเริ่มแห้ง (ประมาณสัปดาห์ละ 2 ครั้ง) แต่ต้องไม่แฉะจนน้ำขัง',
    careMissions: ['ตรวจความชื้นดิน', 'ตัดก้านดอกแห้งที่โรยแล้ว', 'พ่นละอองหมอกรอบพุ่มใบ', 'ตรวจปลายใบไหม้'],
    cautions: 'เมื่อขาดน้ำใบจะลู่ตกทันที ห้ามนำไปตั้งกลางแดดจัดเพราะใบจะไหม้และดอกจะเหี่ยว',
    features: ['ออกดอกสีขาวสง่างาม', 'ดูดซับสารเบนซีนและไอระเหย', 'บ่งบอกความกระหายน้ำได้ชัด'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2tHGchDbIE-6jtprLmM7KVK2CI89NK1DLxo21kEASp3LRaUYKnq9kaJn_QjIprnPgTUej877q9rPox90pS5kdNQmiHfM1aJ1i_MOgSEsKbE43Yfe_Pcpvpj26_cbX_IXK0E77N7RhxLNcT2O0gvxb1VDpu3-snj6GtFEQG8WSrKKZlOs48khLj32gvA4nTd8ZL-B4aYV-bXtQugZgOFqqAGbkfStAVxTHt0TE__WlBbvLvegBmCpr',
  },
  {
    id: 'calathea-orbifolia',
    thaiName: 'คล้าใบตอง',
    englishName: 'Calathea Orbifolia',
    scientificName: 'Calathea orbifolia',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง'],
    wateringGuide: 'รักษาดินให้มีความชื้นสม่ำเสมอแต่ไม่แฉะ ใช้น้ำพักหรือน้ำกรองเพื่อป้องกันขอบใบไหม้',
    careMissions: ['ตรวจความชื้นดิน', 'พ่นละอองน้ำเพิ่มความชื้นในอากาศ', 'เช็ดลายใบกลมโต', 'ตรวจขอบใบแห้ง'],
    cautions: 'ไวต่อคลอรีนในน้ำประปาและความชื้นต่ำในห้องแอร์ ห้ามโดนแดดตรงเพราะลวดลายจะซีดหาย',
    features: ['ลวดลายใบทางเงินสวยงามระดับผลงานศิลปะ', 'ใบหุบขึ้นตอนกลางคืน', 'ชอบบรรยากาศชุ่มชื้น'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVT8JOuzI_y9UrD9kJ155pdrB5c3pq6xSoK1-EXSZX1Diyds-f-R8SMZHqx-kPxji8Tcv9g3CcJsFHZn50zw9xhbNYFD0_wVF1NLaSuk6wswNyQ9gOQe38pZW6O5BLgM1-WvSCJ4KLGnbuOusAjuHxLQzBpZfHorpZAS7HlQS6EmeZwXBwmAOL37yrQZ_PyhwrmszNvlFK5K5r_vgEJnMhn0tJzsGXzFaNGnt0P8cUaN96sLINlhVd',
  },
  {
    id: 'dieffenbachia',
    thaiName: 'สาวน้อยประแป้ง',
    englishName: 'Dumb Cane',
    scientificName: 'Dieffenbachia seguine',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ริมหน้าต่าง', 'ในห้อง'],
    wateringGuide: 'รดน้ำเมื่อดินแห้ง 1-2 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง ระบายน้ำได้ดี',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดใบด่างขาว-เขียว', 'หมุนกระถางรับแสงสมดุล', 'ตัดใบแก่โคนต้น'],
    cautions: 'ยางมีสารระคายเคืองสูงมาก ควรสวมถุงมือเมื่อตัดแต่ง และวางให้พ้นมือเด็กและสัตว์เลี้ยง',
    features: ['ลวดลายใบด่างขาวกระจายสวยสะดุดตา', 'พุ่มใบขนาดกลางประดับห้อง', 'ฟอกอากาศ'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2tHGchDbIE-6jtprLmM7KVK2CI89NK1DLxo21kEASp3LRaUYKnq9kaJn_QjIprnPgTUej877q9rPox90pS5kdNQmiHfM1aJ1i_MOgSEsKbE43Yfe_Pcpvpj26_cbX_IXK0E77N7RhxLNcT2O0gvxb1VDpu3-snj6GtFEQG8WSrKKZlOs48khLj32gvA4nTd8ZL-B4aYV-bXtQugZgOFqqAGbkfStAVxTHt0TE__WlBbvLvegBmCpr',
  },
  {
    id: 'jasmine',
    thaiName: 'มะลิซ้อน',
    englishName: 'Arabian Jasmine',
    scientificName: 'Jasminum sambac',
    optimalLight: 'แสงมาก',
    optimalLocations: ['ระเบียง', 'หน้าบ้าน'],
    wateringGuide: 'รดน้ำวันละ 1 ครั้งช่วงเช้าเมื่อดินชั้นบนแห้ง ระบายน้ำได้ดี ห้ามให้น้ำขังแฉะ',
    careMissions: ['ตรวจความชื้นดิน', 'ตัดแต่งกิ่งหลังดอกโรย', 'ใส่ปุ๋ยบำรุงดอก', 'ตรวจหนอนเจาะดอก'],
    cautions: 'หากได้รับแสงแดดไม่เพียงพอจะไม่ออกดอกและกิ่งจะยืดยาวอ่อนแอ',
    features: ['ดอกสีขาวบริสุทธิ์กลิ่นหอมชื่นใจ', 'ชอบแดดจัดกลางแจ้ง', 'ไม้มงคลคู่บ้านไทย'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPUFW3ReANWciAtRwxOQj88jc3dz29vRgg44ax7G4Nt4GIbDTfYjIgcTplkSvq9OAK_nB_XQ9HGDpoFcO8zueq8KkyPi0XkBVbKXSlnlRZ-jP9f8PGyPCZQ2PoAd-XCMpZnqY960KK0dWmTbg9YfzKmHVVkhFBVze8FkxDCQbicIeWh3xiyLEcA7Y96t7XOKvwfRtoG8irbb96z_f_DeYAzfAMHuVDgn-X1xCkxOTEV0TF6nYPQVaG',
  },
  {
    id: 'cactus',
    thaiName: 'กระบองเพชร',
    englishName: 'Echinopsis Cactus',
    scientificName: 'Echinopsis calochlora',
    optimalLight: 'แสงมาก',
    optimalLocations: ['ระเบียง', 'หน้าบ้าน', 'ริมหน้าต่าง'],
    wateringGuide: 'รดน้ำ 7-10 วันต่อครั้ง เมื่อดินแห้งสนิททั้งกระถางเท่านั้น ห้ามรดน้ำทุกวัน',
    careMissions: ['ตรวจความชื้นดิน', 'ตรวจหาเพลี้ยแป้งซอกหนาม', 'หมุนรับแดดรอบทิศ', 'ใส่ปุ๋ยออสโมโค้ท'],
    cautions: 'ความชื้นสะสมคือนักฆ่าอันดับหนึ่ง ระวังหนามแหลมคมเมื่อจับต้อง',
    features: ['ทนแล้งสูงสุด', 'ดอกขนาดใหญ่สีชมพูขาวบานสะพรั่ง', 'ประหยัดพื้นที่'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjoip1rOb930dBKNdIMD3btA2coSkVph3fyfBiqtN2vG5pq7KixjUABQHxvJqjk6-hGPXk1E8GJWxJ3YPY2GxpjjDY-tI2m82LT2mDW5ddqBprLteXlg4Rv9EC2E3uV_Mk2aLscYk2LhrIi6p2xaok_JLvqQJdpfyuyZ6msOBFKbqwyo7cPgn0EOq6kW-Or9FurYV6ZgNSQddqYcmL9wwwRwb_rOONTwMZ7jqWv48_VNk3rjw0yCIe',
  },
  {
    id: 'basil',
    thaiName: 'โหระพาอิตาเลียน',
    englishName: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    optimalLight: 'แสงมาก',
    optimalLocations: ['ริมหน้าต่าง', 'ระเบียง', 'หน้าบ้าน'],
    wateringGuide: 'รดน้ำเมื่อหน้าดินเริ่มแห้ง วันละ 1 ครั้งช่วงเช้า ดินต้องโปร่งระบายน้ำได้ดี',
    careMissions: ['ตรวจความชื้นดิน', 'เด็ดยอดส่งเสริมให้แตกพุ่มหนา', 'ตัดใบปรุงอาหารสด', 'ตรวจแมลงหวี่ขาว'],
    cautions: 'ต้องการแสงแดดอย่างน้อย 4-6 ชั่วโมงต่อวัน หากขาดแดดกิ่งจะลีบและกลิ่นน้ำมันหอมจะลดลง',
    features: ['สมุนไพรกลิ่นหอมปรุงอาหารรสเลิศ', 'โตไว เก็บเกี่ยวได้ตลอด', 'ใบดกเขียวสด'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCnKo6FZEOta18yFB5EBJjbzLuKo6cmEv_JUbQaWonlNCxbpgn9ldJpXkC0lQzWhOYmAZVmmy7A_4vCB0a5rHW40f_kSpqvx685QW36P6u_HH7o_dw7OLvlI48EOQEBksWW_GV8aoZWvkrrXEyNQgRDc4PEugWCHnp1VZgqB95czO8CiMEwGvEiO8Up0qiuxrkwjlVLYEa-5pYmMrM0BPNUnmxY6ia0jOQs8w6UI7vuQEVI13ILPLx',
  },
  {
    id: 'fiddle-leaf-fig',
    thaiName: 'ไทรใบสัก',
    englishName: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ริมหน้าต่าง', 'ระเบียง'],
    wateringGuide: 'รดน้ำเมื่อดินแห้งลึก 2 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง ปล่อยให้น้ำไหลผ่านกระถางหมดจด',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดใบขนาดใหญ่ดักจับฝุ่น', 'หมุนกระถางรับแสงให้ลำต้นตรง', 'ตรวจจุดสีน้ำตาลบนใบ'],
    cautions: 'ไม่ชอบลมเย็นจากเครื่องปรับอากาศเป่าใส่โดยตรง และไวต่อการรดน้ำเกินขนาด',
    features: ['ใบใหญ่รูปไวโอลินหรูหรา', 'ต้นไม้ยอดนิยมของนักแต่งบ้านสไตล์มินิมอล', 'ต้นสูงสง่า'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABSs8kAI1uu-eBbxhon4G2Tdtc1npTSpQQLmHJLIgPRl5bMijAY-YnkSlYFx8yMG75F-Pqm334qhNS-3S0s6kyMkj76oX_smqepnKk6VDxfsMsM-i2cE7ew1R2v4IW9VAnlb9MYKZmTEWsP4U07cEwhlXLNb_pXdDeP4l445Xkb_gZtYF5IrmB-ICUiL-hJKnCYNlMoOE7hapwNuWV0UQYvGsia-5aWUTqLz86d-s74Iu0mv64IZRX',
  },
  {
    id: 'aloe-vera',
    thaiName: 'ว่านหางจระเข้',
    englishName: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    optimalLight: 'แสงมาก',
    optimalLocations: ['ระเบียง', 'หน้าบ้าน', 'ริมหน้าต่าง'],
    wateringGuide: 'รดน้ำ 1-2 สัปดาห์ต่อครั้ง เมื่อดินแห้งสนิท กาบใบอวบน้ำกักเก็บความชื้นได้นาน',
    careMissions: ['ตรวจความชื้นดิน', 'ตรวจโคนกาบใบไม่ให้เน่า', 'หมุนกระถาง', 'ตัดกาบใบล่างไปใช้ประโยชน์'],
    cautions: 'ระวังอย่าให้มีน้ำขังในจานรองกระถาง ดินต้องผสมทรายหรือเพอร์ไลต์ระบายน้ำดี',
    features: ['เนื้อวุ้นรักษาแผลไฟไหม้บำรุงผิว', 'ทนทาน เลี้ยงง่ายมาก', 'ไม้ยาสมุนไพรประจำบ้าน'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjoip1rOb930dBKNdIMD3btA2coSkVph3fyfBiqtN2vG5pq7KixjUABQHxvJqjk6-hGPXk1E8GJWxJ3YPY2GxpjjDY-tI2m82LT2mDW5ddqBprLteXlg4Rv9EC2E3uV_Mk2aLscYk2LhrIi6p2xaok_JLvqQJdpfyuyZ6msOBFKbqwyo7cPgn0EOq6kW-Or9FurYV6ZgNSQddqYcmL9wwwRwb_rOONTwMZ7jqWv48_VNk3rjw0yCIe',
  },
  {
    id: 'boston-fern',
    thaiName: 'เฟิร์นบอสตัน',
    englishName: 'Boston Fern',
    scientificName: 'Nephrolepis exaltata',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ริมหน้าต่าง', 'ในห้อง', 'ระเบียง'],
    wateringGuide: 'รดน้ำเมื่อผิวดินเริ่มแห้ง ชอบดินชื้นแต่ไม่ขังแฉะ สัปดาห์ละ 2-3 ครั้ง',
    careMissions: ['ตรวจความชื้นดิน', 'พ่นละอองหมอกสร้างความชุ่มชื้น', 'ตัดก้านใบแห้งสีน้ำตาล', 'ตรวจปลายใบกรอบ'],
    cautions: 'ห้ามปล่อยให้ดินแห้งผากสนิท และไม่ชอบแดดตรงจัดเพราะใบจะแห้งกรอบร่วงหล่น',
    features: ['ใบพลิ้วไหวเพิ่มความสดชื่นในห้อง', 'ฟอกอากาศเพิ่มความชุ่มชื้นในคอนโด', 'พุ่มแน่นทรงสวย'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2tHGchDbIE-6jtprLmM7KVK2CI89NK1DLxo21kEASp3LRaUYKnq9kaJn_QjIprnPgTUej877q9rPox90pS5kdNQmiHfM1aJ1i_MOgSEsKbE43Yfe_Pcpvpj26_cbX_IXK0E77N7RhxLNcT2O0gvxb1VDpu3-snj6GtFEQG8WSrKKZlOs48khLj32gvA4nTd8ZL-B4aYV-bXtQugZgOFqqAGbkfStAVxTHt0TE__WlBbvLvegBmCpr',
  },
  {
    id: 'philodendron-xanadu',
    thaiName: 'ซานาดู',
    englishName: 'Philodendron Xanadu',
    scientificName: 'Thaumatophyllum xanadu',
    optimalLight: 'แสงรำไร',
    optimalLocations: ['ในห้อง', 'ริมหน้าต่าง', 'ระเบียง'],
    wateringGuide: 'รดน้ำเมื่อผิวดินแห้ง 1 นิ้ว สัปดาห์ละ 1-2 ครั้ง ระบายน้ำได้ดี',
    careMissions: ['ตรวจความชื้นดิน', 'เช็ดทำความสะอาดใบหยัก', 'หมุนกระถางรับแสงรอบด้าน', 'ตรวจแมลงใต้ใบ'],
    cautions: 'ใบหยักสวยงามแต่ไวต่อแดดบ่ายเผา ชอบอากาศถ่ายเทสะดวก',
    features: ['ใบหยักลึกรูปทรงแปลกตาฟอร์มสวย', 'พุ่มแน่นไม่เลื้อยเกะกะ', 'ทนทานต่อสภาพในร่ม'],
    defaultImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVT8JOuzI_y9UrD9kJ155pdrB5c3pq6xSoK1-EXSZX1Diyds-f-R8SMZHqx-kPxji8Tcv9g3CcJsFHZn50zw9xhbNYFD0_wVF1NLaSuk6wswNyQ9gOQe38pZW6O5BLgM1-WvSCJ4KLGnbuOusAjuHxLQzBpZfHorpZAS7HlQS6EmeZwXBwmAOL37yrQZ_PyhwrmszNvlFK5K5r_vgEJnMhn0tJzsGXzFaNGnt0P8cUaN96sLINlhVd',
  },
];

export interface PlantMatchResult {
  totalScore: number; // 0 - 100
  lightScore: number; // 0 - 60
  locationScore: number; // 0 - 40
  suitabilityLevel: 'เหมาะสมมาก' | 'เหมาะสมปานกลาง' | 'ควรปรับปรุง';
  reasons: string[];
  recommendation: string;
}

/**
 * Requirement 3 & 4:
 * Rule-Based Context-Aware Recommendation & Plant Match Score
 * Total 0 - 100:
 * - Light suitability: max 60 points
 * - Planting location suitability: max 40 points
 */
export function calculatePlantMatchScore(
  speciesName: string,
  location: 'indoor' | 'window' | 'balcony' | 'porch',
  light: 'low' | 'medium' | 'high'
): PlantMatchResult {
  // Find species in database by Thai name or scientific name or default to Monstera
  const normalized = speciesName.toLowerCase();
  const plant =
    PLANT_DATABASE.find(
      (p) =>
        normalized.includes(p.thaiName.toLowerCase()) ||
        normalized.includes(p.scientificName.toLowerCase()) ||
        normalized.includes(p.englishName.toLowerCase())
    ) || PLANT_DATABASE[0];

  // Convert input to Thai display terminology
  const locationThaiMap: Record<string, 'ในห้อง' | 'ริมหน้าต่าง' | 'ระเบียง' | 'หน้าบ้าน'> = {
    indoor: 'ในห้อง',
    window: 'ริมหน้าต่าง',
    balcony: 'ระเบียง',
    porch: 'หน้าบ้าน',
  };
  const lightThaiMap: Record<string, 'แสงน้อย' | 'แสงรำไร' | 'แสงมาก'> = {
    low: 'แสงน้อย',
    medium: 'แสงรำไร',
    high: 'แสงมาก',
  };

  const selectedLocThai = locationThaiMap[location] || 'ริมหน้าต่าง';
  const selectedLightThai = lightThaiMap[light] || 'แสงรำไร';

  // 1. Calculate Light Score (Max 60 points)
  let lightScore = 60;
  const lightReasons: string[] = [];

  if (selectedLightThai === plant.optimalLight) {
    lightScore = 60;
    lightReasons.push(`ระดับแสง "${selectedLightThai}" ตรงกับความต้องการธรรมชาติของ${plant.thaiName} (60/60)`);
  } else {
    // Check distance between lights: 'แสงน้อย' <-> 'แสงรำไร' <-> 'แสงมาก'
    const lightLevels = ['แสงน้อย', 'แสงรำไร', 'แสงมาก'];
    const diff = Math.abs(lightLevels.indexOf(selectedLightThai) - lightLevels.indexOf(plant.optimalLight));
    if (diff === 1) {
      lightScore = 38;
      if (selectedLightThai === 'แสงน้อย') {
        lightReasons.push(`ได้รับแสงน้อยไปนิด อาจทำให้การเติบโตช้าลง (38/60)`);
      } else {
        lightReasons.push(`ได้รับแสงแรงกว่าที่ต้องการเล็กน้อย ระวังปลายใบไหม้ (38/60)`);
      }
    } else {
      lightScore = 18;
      if (selectedLightThai === 'แสงน้อย') {
        lightReasons.push(`แสงน้อยเกินไปมาก ขาดพลังงานสังเคราะห์แสง (18/60)`);
      } else {
        lightReasons.push(`แดดจัดเกินไป ใบอาจไหม้เกรียมเสียหายได้ (18/60)`);
      }
    }
  }

  // 2. Calculate Location Score (Max 40 points)
  let locationScore = 40;
  const locReasons: string[] = [];

  if (plant.optimalLocations.includes(selectedLocThai)) {
    locationScore = 40;
    locReasons.push(`ตำแหน่ง "${selectedLocThai}" อากาศถ่ายเทและสอดคล้องกับธรรมชาติของพืช (40/40)`);
  } else {
    // Close match
    if (
      (selectedLocThai === 'ในห้อง' && plant.optimalLocations.includes('ริมหน้าต่าง')) ||
      (selectedLocThai === 'ระเบียง' && plant.optimalLocations.includes('หน้าบ้าน'))
    ) {
      locationScore = 26;
      locReasons.push(`ตำแหน่ง "${selectedLocThai}" พอใช้ได้ แต่อาจต้องคอยตรวจการถ่ายเทอากาศ (26/40)`);
    } else {
      locationScore = 14;
      locReasons.push(`ตำแหน่ง "${selectedLocThai}" มีสภาพแวดล้อมที่ท้าทายต่อ${plant.thaiName} (14/40)`);
    }
  }

  const totalScore = Math.min(100, Math.max(0, lightScore + locationScore));

  let suitabilityLevel: 'เหมาะสมมาก' | 'เหมาะสมปานกลาง' | 'ควรปรับปรุง' = 'เหมาะสมปานกลาง';
  if (totalScore >= 80) {
    suitabilityLevel = 'เหมาะสมมาก';
  } else if (totalScore < 60) {
    suitabilityLevel = 'ควรปรับปรุง';
  }

  // Generate contextual action recommendation
  let recommendation = '';
  if (totalScore >= 80) {
    recommendation = `ตำแหน่ง ${selectedLocThai} พร้อม ${selectedLightThai} ยอดเยี่ยมมาก! ตรงตามธรรมชาติของ${plant.thaiName} จะช่วยให้ใบสมบูรณ์และโตไว`;
  } else if (selectedLightThai === 'แสงน้อย' && plant.optimalLight !== 'แสงน้อย') {
    recommendation = `แนะนำให้ย้าย ${plant.thaiName} เข้าใกล้หน้าต่างมากขึ้น 1-2 เมตร หรือติดไฟปลูกต้นไม้เพื่อเพิ่มแสงรำไร`;
  } else if (selectedLightThai === 'แสงมาก' && plant.optimalLight !== 'แสงมาก') {
    recommendation = `แดดอาจแรงเกินไป แนะนำให้ติดม่านกรองแสงโปร่ง หรือขยับกระถางหลบแดดช่วงบ่ายเพื่อป้องกันใบไหม้`;
  } else if (!plant.optimalLocations.includes(selectedLocThai)) {
    recommendation = `แนะนำให้ลองย้ายไปวางที่ ${plant.optimalLocations.join(' หรือ ')} เพื่อให้อากาศถ่ายเทสะดวกและได้รับแสงที่พอดี`;
  } else {
    recommendation = `หมั่นสังเกตสีใบและการระบายน้ำของกระถาง หากปลายใบเริ่มแห้งให้ขยับตำแหน่งตามคำแนะนำ`;
  }

  return {
    totalScore,
    lightScore,
    locationScore,
    suitabilityLevel,
    reasons: [...lightReasons, ...locReasons],
    recommendation,
  };
}
