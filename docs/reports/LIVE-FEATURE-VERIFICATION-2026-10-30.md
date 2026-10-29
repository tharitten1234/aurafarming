# ผลตรวจ Feature กับระบบจริง — AuraFarming

> Dated report: results apply to the source and environment recorded below. See the [documentation index](../README.md) for current setup and later verification.

วันที่ตรวจ: 30 ตุลาคม 2569 (Asia/Bangkok)

## สภาพแวดล้อม

- Frontend: branch `fix`, เปิดด้วย Vite ที่ `http://127.0.0.1:3000/`
- Browser: Microsoft Edge headless, viewport 390×844
- Backend: Supabase project `vbxyswkoinqpdzcqltfv`, สถานะ `ACTIVE_HEALTHY`
- Edge Function `analyze-plant`: deploy version **24**, สถานะ ACTIVE
- การระบุชนิด: Pl@ntNet จริง; ชื่อไทยและคำแนะนำ: Gemini จริง
- บัญชีชั่วคราวรวม 4 บัญชีในสองรอบ ใช้เฉพาะข้อมูลทดสอบ ไม่มีการแก้ schema หรือข้อมูลของผู้ใช้เดิม

## สิ่งที่แก้และเปิดใช้

1. นำเส้นทาง Demo dataset ที่มีบน hosted function กลับมาไว้ใน source branch เพื่อให้ deploy จาก repository ได้โดยไม่ทำให้ Demo หาย
2. Deploy การแยก audit metadata ของ Gemini สำเร็จ/ไม่สำเร็จ โดยรักษาเส้นทาง `demo-dataset`, model เดิม และการตรวจ token/เจ้าของภาพ
3. เพิ่ม `npm run check:presentation` สำหรับตรวจ Auth, provider, endpoint สแกน และเว็บก่อนนำเสนอ แบบอ่านอย่างเดียว ไม่สร้างบัญชี ไม่อัปโหลดภาพ และไม่เรียก AI

การแก้ภาพเสียและการยกเลิกสแกนจาก commit ก่อนหน้าใน branch `fix` ยังคงอยู่ ส่วน `main` ไม่ได้ถูกรวมงานเพิ่มในรอบนี้

## ผลทดสอบกับ Supabase จริง

| Feature | วิธีตรวจจริง | ผล |
|---|---|---|
| Guest | เรียก Anonymous Auth และตรวจ profile ที่สร้างตาม user ID | ผ่าน |
| Profile ของบัญชีใหม่ | สร้างบัญชีอีเมลชั่วคราวผ่าน Admin Auth API โดยไม่ส่งอีเมล ตรวจ trigger สร้าง profile | ผ่าน |
| Login | กรอกอีเมล/รหัสผ่านในหน้าเว็บจริง | ผ่าน |
| ตั้งชื่อฟาร์ม | กรอกชื่อในเกมและตรวจค่าใน Supabase | ผ่าน |
| สแกนภาพ | เลือก JPEG ในหน้า Scanner จริง และเรียก hosted Edge Function | ผ่าน |
| ชื่อไทย/คำแนะนำ | ตรวจผลตอบกลับและ audit metadata ว่า Gemini ตอบสำเร็จจริง | ผ่าน |
| ยืนยัน/เลือกตำแหน่ง/คะแนน/เพิ่มสวน | กดผ่านหน้าจอจริง แล้วตรวจแถว plants และ confidence เดิม | ผ่าน |
| สิทธิ์ข้ามบัญชี | บัญชี B อ่านตาราง/รูปของบัญชี A ไม่ได้ และเรียก record_care กับพืชของ A ไม่สำเร็จ | ผ่าน |
| ตรวจดิน/รดน้ำ | RPC จริงปฏิเสธรดน้ำก่อนตรวจดิน จากนั้นบันทึก moist → dry → water | ผ่าน |
| ภารกิจตรวจพืช | บันทึกสำเร็จผ่าน RPC จริงและตรวจสถานะ | ผ่าน |
| ภาพการเติบโต | อัปโหลดและบันทึกผ่าน Timeline ในหน้าเว็บจริง แล้วตรวจ growth_logs | ผ่าน |
| ภารกิจและรางวัล | ตรวจภารกิจของพืชที่ทดสอบครบ และตรวจแต้มใน profile จริง | ผ่าน |
| ไม่รับรางวัลซ้ำ | เพิ่ม growth log ซ้ำในสัปดาห์เดิมแล้วตรวจ Aura, XP, coins ไม่เพิ่มซ้ำ | ผ่าน |
| เพิ่มพืชเอง | เรียก add_manual_plant จริง | ผ่าน |
| เปลี่ยนชื่อ/ย้ายตำแหน่ง | เปลี่ยนข้อมูลผ่าน Data API/RPC แล้วอ่านค่ากลับ | ผ่าน |
| เลื่อน/ข้ามภารกิจ | เรียก RPC จริงในพืชทดสอบแยกต่างหาก | ผ่าน |
| Archive | RPC นำพืชออกจากสวน และปฏิเสธการดูแลพืชที่ archive แล้ว | ผ่าน |
| Reload | รีโหลดหน้าเว็บและตรวจต้นไม้/ชื่อฟาร์มยังอยู่ | ผ่าน |
| Logout/Login ใหม่ | เปิดตั้งค่า ออกจากระบบ แล้วกรอกรหัสผ่านกลับเข้าใช้งาน พบสวนเดิม | ผ่าน |
| สลับบัญชี | ใช้หน้าเว็บสลับ A → B → A; B เป็นสวนว่างชื่อแยก และ A ยังมีต้นไม้เดิม | ผ่าน |
| Runtime ใน browser | ตรวจ pageerror ระหว่าง session flow และการสลับบัญชี | ไม่พบ error |

กิจกรรมในตารางบางรายการทดสอบผ่านหน้าเว็บ และบางรายการเรียก Supabase client โดยตรงตามคอลัมน์วิธีตรวจ จึงไม่ควรอ้างว่าทุกรายการผ่านการกด UI ครบทุกปุ่ม

## ผลสแกนตัวอย่างที่วัดได้

- ภาพทดสอบ: JPEG ชบาที่มีอยู่ในเครื่อง
- ชื่อวิทยาศาสตร์: `Hibiscus rosa-sinensis`
- ชื่อไทย: **ชบา**
- Pl@ntNet confidence: **0.56788 หรือประมาณ 56.8%**
- เวลาตั้งแต่กดสแกนจนได้ผล: **18,663 ms**
- `careProvider`: `gemini`
- `careStatus`: `available`

ระบบยังแสดงคำเตือนความมั่นใจต่ำตามเกณฑ์เดิมและให้ผู้ใช้ยืนยัน ค่าความมั่นใจไม่ได้ถูกเพิ่มเพื่อให้การสาธิตดูดี และเวลา/ผลของภาพหนึ่งรูปไม่ใช่ค่าเฉลี่ยหรือ accuracy ของโครงการ

## การแก้ขั้นตอนทดสอบ

รอบแรกผ่านงานหลักจนถึง archive แต่สคริปต์กด logout โดยยังไม่เปิดเมนูตั้งค่า จึง timeout ที่ขั้นตอนทดสอบ ไม่ใช่หลักฐานว่า logout ของแอปล้มเหลว หลังล้างข้อมูลรอบแรกแล้วได้ทดสอบ session flow แยกอีกครั้งโดยเปิดเมนูตั้งค่าก่อน ผล logout, login ใหม่ และสลับบัญชีผ่านทั้งหมด โดยไม่เรียก Pl@ntNet/Gemini ซ้ำ

## การล้างข้อมูล

ลบภาพใน namespace ของบัญชีทดสอบก่อนลบ Auth user และตรวจ owned rows หลัง cascade จากนั้นตรวจซ้ำผ่าน SQL แบบอ่านอย่างเดียว:

| รายการของบัญชีทดสอบทั้งสี่ | จำนวนคงเหลือ |
|---|---:|
| Auth users | 0 |
| Profiles | 0 |
| Plants | 0 |
| Plant scans | 0 |
| Growth logs | 0 |
| Storage images | 0 |

คีย์ฝั่ง server และรหัสผ่านสุ่มใช้ในหน่วยความจำของกระบวนการทดสอบเท่านั้น ไม่ใส่ใน source, รายงาน หรือ commit

## ผลตรวจอัตโนมัติหลังแก้

- TypeScript frontend: ผ่าน
- Production build: ผ่าน; มีคำเตือน bundle หลักประมาณ 707 kB
- Frontend/domain/database tests: **13 ผ่าน**
- Edge TypeScript: ผ่าน
- Edge tests: **8 ผ่าน** รวม regression ที่ยืนยัน Demo dataset ไม่เรียก Gemini
- `npm run check:presentation`: ผ่านทุกจุดที่ตรวจในขณะทดสอบ

## ข้อจำกัดและสิ่งที่ยังไม่ตรวจ

- บัญชีอีเมลทดสอบยืนยันผ่าน Admin Auth API เพื่อไม่ส่งอีเมลไปหาบุคคลอื่น จึงยังไม่ยืนยันการรับอีเมลจริง, ลิงก์ยืนยันจาก mailbox, การเปลี่ยน Guest เป็นบัญชีผ่านอีเมล หรือการลืมรหัสผ่านครบเส้นทาง
- การตั้งค่าปัจจุบันเปิด Email และ Anonymous sign-in, ต้องยืนยันอีเมล และยังปิด Google provider; ไม่ได้เปิด Google เพิ่ม
- กล้องมือถือจริงและเบราว์เซอร์ภายใน Instagram/LINE ยังต้องทดสอบบนอุปกรณ์นั้น การเลือกภาพผ่าน Edge ผ่านแล้ว
- Demo dataset ทดสอบ regression แบบจำลองและรักษา route บน deployment แต่รอบนี้ไม่ได้สแกนผ่านหน้า Demo จริง
- ไม่ได้ทำ load test หรือประเมิน accuracy ด้วยชุดภาพมาตรฐาน และยังไม่ได้ปรับ quota ให้เป็น atomic transaction
- API ภายนอก โควตา และอินเทอร์เน็ตอาจเปลี่ยนหลังตรวจ ควรรัน preflight และทดสอบภาพที่จะใช้จริงก่อนเริ่ม

Security advisors ยังมีข้อความเตือน Guest access ซึ่งสอดคล้องกับการรองรับ Guest และมีการทดสอบแยกเจ้าของข้อมูลแล้ว ส่วนตาราง Demo เปิด RLS ไม่มี client policy จึงเข้าผ่าน server เท่านั้น ไม่เปิด policy เพิ่มเพื่อให้คำเตือนหาย ดู [คำอธิบาย RLS ไม่มี policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) และ [คำอธิบาย Anonymous access](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins) นอกจากนี้ Leaked Password Protection ยังปิดอยู่ ดู [เอกสารการป้องกันรหัสผ่านรั่วไหล](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## ใช้ก่อนพรีเซนต์

เปิด terminal แรก รัน `npm run dev` และเปิดทิ้งไว้ จากนั้นเปิด terminal อีกหน้ารัน `npm run check:presentation` หากใช้ URL หรือพอร์ตอื่น สามารถรัน `npm run check:presentation -- https://your-app-url` ได้ การผ่าน preflight ยืนยันเพียงจุดเชื่อมต่อเบื้องต้น ไม่ใช่การรับรองโควตา AI หรือ feature ทั้งหมด
