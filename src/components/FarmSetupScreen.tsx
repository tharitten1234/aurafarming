import {useState} from 'react';
import {ASSETS} from '../data/mockData';

export function FarmSetupScreen({onSave,onLogout}:{onSave:(name:string)=>Promise<boolean>;onLogout:()=>Promise<void>}) {
 const [name,setName]=useState('');const [saving,setSaving]=useState(false);
 return <section className="flex-1 flex flex-col items-center justify-center p-6 gap-5 bg-[#1a0f09]">
  <img src={ASSETS.avatar} alt="เจ้าของฟาร์ม" className="w-20 h-20 pixelated rounded-xl"/>
  <h1 className="text-xl font-bold text-amber-200">ตั้งชื่อฟาร์มของคุณ 🌱</h1>
  <p className="text-sm text-center text-[#d6b490]">ชื่อนี้จะอยู่ในสวนและโปรไฟล์ของบัญชีคุณ</p>
  <form className="wood-box rounded-2xl p-4 w-full space-y-4" onSubmit={async e=>{e.preventDefault();if(saving)return;setSaving(true);try{await onSave(name);}finally{setSaving(false);}}}>
   <label htmlFor="farm-name" className="block text-sm">ชื่อฟาร์ม</label>
   <input id="farm-name" autoFocus required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น สวนของฉัน" className="w-full bg-[#160b06] border-2 border-[#522e17] rounded-xl p-3 text-sm outline-none focus:border-emerald-500"/>
   <button type="submit" disabled={saving||!name.trim()} className="emerald-btn w-full py-3 rounded-xl font-bold">{saving?'กำลังบันทึก…':'บันทึกชื่อและเข้าสวน'}</button>
  </form>
  <button disabled={saving} onClick={()=>void onLogout()} className="text-xs text-amber-200 underline">กลับหน้าเข้าสู่ระบบ</button>
 </section>;
}
