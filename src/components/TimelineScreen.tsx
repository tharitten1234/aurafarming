import React, { useState } from 'react';
import { TimelinePhoto, Plant } from '../types';
import { sounds } from '../utils/soundEffects';

interface TimelineScreenProps {
  plants: Plant[];
  timelinePhotos: TimelinePhoto[];
  initialPlantId?: string;
  onBack: () => void;
  onAddPhoto: (plantId:string,file:File,caption:string,badge:string,careActivity:string,notes:string) => Promise<boolean>;
  onShowToast: (msg: string, icon?: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  plants,
  timelinePhotos,
  initialPlantId,
  onBack,
  onAddPhoto,
  onShowToast,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState(
    initialPlantId && plants.some((p) => p.id === initialPlantId)
      ? initialPlantId
      : plants[0]?.id || 'dieff-1'
  );
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newBadge, setNewBadge] = useState('แตกยอดใหม่ ✨');
  const [newCareActivity, setNewCareActivity] = useState('ตรวจความชื้นดินและเช็ดใบ');
  const [newNotes, setNewNotes] = useState('');
  const [photoFile,setPhotoFile]=useState<File|null>(null);
  const [saving,setSaving]=useState(false);

  const filteredPhotos = timelinePhotos.filter((p) => p.plantId === selectedPlantId);
  const currentPlant = plants.find((p) => p.id === selectedPlantId) || plants[0];

  const handleAddNewPhoto=async(e:React.FormEvent)=>{
    e.preventDefault();if(!currentPlant||!photoFile||saving)return;setSaving(true);
    try{if(await onAddPhoto(currentPlant.id,photoFile,newCaption,newBadge,newCareActivity,newNotes)){
      setShowAddModal(false);setNewCaption('');setNewNotes('');setPhotoFile(null);sounds.playShutter();
    }}finally{setSaving(false);}
  };
  const day1Photo = filteredPhotos[filteredPhotos.length - 1];
  const latestPhoto = filteredPhotos[0];

  if(!currentPlant)return <div className="flex-1 p-6 flex flex-col justify-center text-center gap-4"><h1>บันทึกการเติบโต</h1><p>เพิ่มพืชในสวนก่อนบันทึกภาพ 🌱</p><button className="emerald-btn rounded-xl p-3" onClick={onBack}>กลับสวน</button></div>;
  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#f7f1e5] text-[#3e2723]">
      {/* Background Dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#f7f1e5',
          backgroundImage: 'radial-gradient(#d6c7b2 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Header */}
      <header className="bg-[#3b2012] border-b-4 border-[#241309] text-[#f7e6cd] px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-20">
        {/* Back Button */}
        <button
          type="button"
          aria-label="ย้อนกลับ"
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="w-9 h-9 rounded-lg bg-[#53301c] hover:bg-[#643b23] border-2 border-[#241309] flex items-center justify-center text-[#fbda96] active:translate-y-0.5 transition-transform shadow-[0_2px_0_#180d07] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Screen Title */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#fbbf24] text-[11px] animate-pulse">✦</span>
          <h1 className="text-[17px] font-bold tracking-wide text-[#fff3db] drop-shadow-[0_1.5px_0_#1c0c05]">
            Photo Timeline
          </h1>
          <span className="text-[#fbbf24] text-[11px] animate-pulse">✦</span>
        </div>

        {/* Compare Action Shortcut (Requirement 8: เปรียบเทียบภาพแรกกับภาพล่าสุด) */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            if(filteredPhotos.length<2){onShowToast('บันทึกอย่างน้อย 2 ภาพเพื่อเปรียบเทียบ','📷');return;}
            setShowCompareModal(true);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#53301c] hover:bg-[#653b22] border-2 border-[#241309] flex items-center gap-1.5 text-[#fbda96] text-[12px] font-medium transition-all active:scale-95 shadow-[0_2px_0_#180d07] cursor-pointer"
          title="เปรียบเทียบภาพแรกกับภาพล่าสุด"
        >
          <svg className="w-3.5 h-3.5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>เทียบภาพ</span>
        </button>
      </header>

      {/* Sub-header Bar: Plant Selector & Stats */}
      <section className="bg-[#e9dac1] px-4 py-2.5 border-b-2 border-[#d5be9b] flex items-center justify-between shrink-0 shadow-inner z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#795548] font-medium">ต้นไม้:</span>
          <div className="relative inline-block">
            <select
              value={selectedPlantId}
              onChange={(e) => {
                sounds.playTap();
                setSelectedPlantId(e.target.value);
              }}
              className="flex items-center gap-1.5 bg-[#fdfaf3] hover:bg-white px-2.5 py-1 rounded-md border-2 border-[#8d5b38] shadow-sm text-xs font-bold text-[#3e2723] focus:outline-none cursor-pointer"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  🪴 {p.nickname} ({p.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2e5b32] bg-[#d2e8d3] px-2 py-0.5 rounded border border-[#9fcb9e]">
            <span>🌱</span>
            <span className="font-silkscreen text-[10px]">{filteredPhotos.length}</span> ภาพบันทึก
          </span>
        </div>
      </section>

      {/* Scrollable Photo Timeline Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[calc(var(--navigation-clearance)+16px)] space-y-4 no-scrollbar relative z-10">
        {/* Timeline Guide Rail */}
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[3px] before:bg-gradient-to-b before:from-[#8d5b38] before:via-[#4caf50] before:to-[#2e7d32] before:rounded-full">
          {filteredPhotos.map((photo, idx) => (
            <article
              key={photo.id}
              className="relative group bg-[#fdfaf3] rounded-2xl border-[3px] border-[#4a2e1b] p-3 shadow-[0_4px_0_#3a2214] transition-transform hover:-translate-y-0.5"
            >
              {/* Timeline Node Marker */}
              <div
                className={`absolute -left-[30px] top-4 w-5 h-5 rounded-full border-2 shadow-sm flex items-center justify-center text-[9px] text-white font-bold ${
                  photo.isLatest
                    ? 'bg-[#38b449] border-[#1f5726]'
                    : idx === 1
                    ? 'bg-[#f59e0b] border-[#8b4513]'
                    : 'bg-[#8d5b38] border-[#4a2e1b]'
                }`}
              >
                {photo.isLatest ? '✓' : filteredPhotos.length - idx}
              </div>

              {/* Photo Card Header: Date & Plant Match Score Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3e2723] flex items-center gap-1">
                    <span className="text-[13px]">📅</span> {photo.date}
                  </span>
                  {photo.isLatest && (
                    <span className="text-[10px] text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.2 rounded font-medium border border-[#c8e6c9]">
                      ล่าสุด
                    </span>
                  )}
                </div>

                {/* Plant Match Score Badge (Requirement 8) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                    🎯 Match: {photo.plantMatchScore ?? currentPlant.plantMatchScore}/100
                  </span>
                </div>
              </div>

              {/* Photo Frame */}
              <div className="relative w-full aspect-square bg-[#2e190e] p-2 rounded-xl shadow-[inset_0_3px_0_#4f2e18,0_3px_0_#1a0f0a] overflow-hidden">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover rounded-lg border border-[#4a2e1b] shadow-inner"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
                      photo.badgeColor || 'bg-[#c8e6c9] text-[#1b5e20] border-[#81c784]'
                    }`}
                  >
                    <span>{photo.badgeIcon || '✨'}</span>
                    <span>{photo.badgeLabel}</span>
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-[#1e1008]/85 backdrop-blur-xs text-[#fdfaf3] text-[10px] px-2 py-0.5 rounded-md border border-[#52331f]">
                  {photo.caption}
                </div>
              </div>

              {/* Requirement 8: Care Activities & Notes */}
              <div className="mt-2.5 pt-2 border-t border-[#e2d6c3] space-y-1 text-xs">
                {photo.careActivity && (
                  <div className="flex items-start gap-1.5 text-[11px] text-[#5c371d]">
                    <span className="text-emerald-600 font-bold shrink-0">🛠️ กิจกรรมดูแล:</span>
                    <span className="text-stone-700 font-medium">{photo.careActivity}</span>
                  </div>
                )}
                {photo.notes && (
                  <div className="flex items-start gap-1.5 text-[11px] text-[#5c371d]">
                    <span className="text-amber-700 font-bold shrink-0">📝 หมายเหตุ:</span>
                    <span className="text-stone-600 italic">{photo.notes}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Quick Add Photo Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setShowAddModal(true);
            }}
            className="w-full py-2.5 bg-[#4a2e18] hover:bg-[#5c371d] active:translate-y-0.5 text-amber-200 border-2 border-[#2b170c] rounded-xl shadow-[0_3px_0_#2b170c] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📷</span>
            <span>+ บันทึกภาพพัฒนาการใหม่ (+15 AuraScore)</span>
          </button>
        </div>

        {/* Encouraging Footer Card */}
        <div className="text-center py-2 px-3 bg-[#e8decb]/60 rounded-xl border border-[#cbbca3]">
          <p className="text-[11px] text-[#6d4c41]">
            ✨ บันทึกภาพเรียงตามเวลา และกดปุ่ม &quot;เทียบภาพ&quot; เพื่อดูเปรียบเทียบภาพแรกกับภาพล่าสุดได้ตลอดเวลา
          </p>
        </div>
      </div>

      {/* Compare Modal (Requirement 8: เปรียบเทียบภาพแรกกับภาพล่าสุด) */}
      {showCompareModal && day1Photo && latestPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[360px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>⇄</span> เทียบพัฒนาการของ {currentPlant.nickname}
              </h3>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#ecdcc3]">
              เลื่อนแถบเพื่อเปรียบเทียบ <strong>ภาพแรก (วันรับเข้าสวน)</strong> กับ <strong>ภาพถ่ายล่าสุด</strong>
            </p>

            {/* Split Comparison Viewer */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-[#5a3624] bg-black">
              {/* Image 1: Day 1 (First Photo) */}
              <img
                src={day1Photo?.photoUrl || currentPlant.image}
                alt="ภาพวันแรก"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Image 2: Latest (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
              >
                <img
                  src={latestPhoto?.photoUrl || currentPlant.image}
                  alt="ภาพล่าสุด"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider Line Divider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 shadow-[0_0_8px_#facc15] pointer-events-none"
                style={{ left: `${compareSlider}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7 h-7 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                  ⇄
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded border border-white/30 pointer-events-none">
                ภาพแรก ({day1Photo?.date || 'วันแรก'})
              </div>
              <div className="absolute top-2 right-2 bg-emerald-950/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-400/40 pointer-events-none">
                ภาพล่าสุด ({latestPhoto?.date || 'ล่าสุด'})
              </div>
            </div>

            {/* Range Slider Control */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={compareSlider}
                onChange={(e) => setCompareSlider(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-amber-200/70">
                <span>◀ ภาพวันแรก</span>
                <span>ภาพล่าสุด ▶</span>
              </div>
            </div>

            <div className="bg-[#24130a] p-2.5 rounded-lg border border-[#4d2a17] text-[11px] text-[#ebd8be] space-y-1">
              <p>🌱 <strong>ระยะเวลาปลูก:</strong> {currentPlant.daysPlanted} วัน</p>
              <p>🎯 <strong>Plant Match Score:</strong> {currentPlant.plantMatchScore}/100</p>
            </div>

            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              className="w-full emerald-btn py-2 rounded-xl text-white font-bold text-xs"
            >
              ปิดหน้าต่างเปรียบเทียบ
            </button>
          </div>
        </div>
      )}

      {/* Add Milestone Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewPhoto}
            className="wood-box w-full max-w-[340px] rounded-2xl p-4 text-[#f7edd5] space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>📷</span> บันทึกภาพการเติบโต (+15 AuraScore)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                ป้ายกำกับเหตุการณ์:
              </label>
              <select
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full bg-[#180c07] border-2 border-[#5a3624] rounded-lg px-2.5 py-1.5 text-xs text-amber-100 focus:outline-none"
              >
                <option value="แตกยอดใหม่ ✨">แตกยอดใหม่ ✨</option>
                <option value="มีใบใหม่คลี่ 🌱">มีใบใหม่คลี่ 🌱</option>
                <option value="ออกดอกบานสะพรั่ง 🌸">ออกดอกบานสะพรั่ง 🌸</option>
                <option value="เปลี่ยนกระถางใหม่ 🪴">เปลี่ยนกระถางใหม่ 🪴</option>
                <option value="ตัดแต่งกิ่งฟอร์มสวย ✂️">ตัดแต่งกิ่งฟอร์มสวย ✂️</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                กิจกรรมการดูแลที่ทำ:
              </label>
              <input
                type="text"
                placeholder="เช่น ตรวจความชื้นดิน, เช็ดใบ, หมุนกระถาง"
                value={newCareActivity}
                onChange={(e) => setNewCareActivity(e.target.value)}
                className="w-full bg-[#180c07] border-2 border-[#5a3624] rounded-lg px-3 py-1.5 text-xs text-amber-100 placeholder-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                หมายเหตุเพิ่มเติม:
              </label>
              <input
                type="text"
                placeholder="เช่น ใบสดใส ดินระบายน้ำดี แสงพอเหมาะ..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#180c07] border-2 border-[#5a3624] rounded-lg px-3 py-2 text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                maxLength={60}
              />
            </div>

            <label className="block text-xs">เลือกภาพใหม่<input aria-label="ภาพการเติบโต" type="file" accept="image/*" disabled={saving} onChange={e=>setPhotoFile(e.target.files?.[0]??null)} className="block w-full py-2"/></label>
            <label className="block text-xs">ถ่ายภาพด้วยกล้อง<input aria-label="ถ่ายภาพการเติบโต" type="file" accept="image/*" capture="environment" disabled={saving} onChange={e=>setPhotoFile(e.target.files?.[0]??null)} className="block w-full py-2"/></label>
            {photoFile&&<p className="text-xs text-emerald-300">พร้อมบันทึก: {photoFile.name}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 wood-button py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit" disabled={!photoFile || saving}
                className="flex-1 emerald-btn py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                บันทึกภาพ (+15 แต้ม)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

