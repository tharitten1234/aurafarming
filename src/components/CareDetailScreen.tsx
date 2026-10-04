import React, { useState } from 'react';
import { Plant, Task } from '../types';
import { ASSETS } from '../data/mockData';
import { sounds } from '../utils/soundEffects';

interface CareDetailScreenProps {
  plant: Plant;
  tasks?: Task[];
  onBack: () => void;
  onUpdateNickname: (plantId: string, newNickname: string) => Promise<boolean>;
  onUpdateLocation?: (plantId: string, newLocation: string, newSunlight: string) => Promise<boolean>;
  onRemovePlant?: (plantId: string) => Promise<boolean>;
  onCompleteCheck: (plantId: string, result: 'dry' | 'moist' | 'wet') => Promise<boolean>;
  onCompleteTask?: (taskId: string) => Promise<boolean>;
  onOpenTimeline: (plantId?: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const LOCATION_OPTIONS = [
  { location: 'ริมหน้าต่าง', sunlight: 'แสงแดดส่องถึง รำไร', icon: '🪟' },
  { location: 'ระเบียง', sunlight: 'แสงมาก แดดตรง', icon: '🌿' },
  { location: 'ในห้อง', sunlight: 'แสงน้อย อากาศถ่ายเท', icon: '🛋️' },
  { location: 'หน้าบ้าน', sunlight: 'แสงแดดจัดตลอดวัน', icon: '🏡' },
];

export const CareDetailScreen: React.FC<CareDetailScreenProps> = ({
  plant,
  tasks = [],
  onBack,
  onUpdateNickname,
  onUpdateLocation,
  onRemovePlant,
  onCompleteCheck,
  onCompleteTask,
  onOpenTimeline,
  onShowToast,
}) => {
  const [showEditName, setShowEditName] = useState(false);
  const [tempNickname, setTempNickname] = useState(plant.nickname);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Filter tasks specific to this plant
  const plantTasks = tasks.filter((t) => t.plantId === plant.id);

  // Save nickname
  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    if (tempNickname.trim()) {
      if (!await onUpdateNickname(plant.id, tempNickname.trim())) return;
      setShowEditName(false);
      onShowToast(`เปลี่ยนชื่อเป็น "${tempNickname.trim()}" เรียบร้อย ✨`, '✏️');
    }
  };

  // Change location
  const handleSelectLocation = async (loc: string, sun: string) => {
    sounds.playTap();
    if (onUpdateLocation) {
      if (!await onUpdateLocation(plant.id, loc, sun)) return;
    }
    setShowEditLocation(false);
    onShowToast(`ย้ายมุม ${plant.nickname} ไปที่ "${loc}" เรียบร้อย! 📍`, '✨');
  };

  // Remove plant
  const handleConfirmRemove = async () => {
    sounds.playTap();
    if (onRemovePlant && await onRemovePlant(plant.id)) setShowDeleteModal(false);
  };

  // Soil moisture test
  const handleSelectMoisture = async (result: 'dry' | 'moist' | 'wet') => {
    sounds.playWater();
    if (!await onCompleteCheck(plant.id, result)) return;
    setShowCheckModal(false);


  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#eedcc0] text-[#3d2314] font-prompt">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#eedcc0',
          backgroundImage: `
            radial-gradient(#dfc6a3 15%, transparent 16%),
            radial-gradient(#dfc6a3 15%, transparent 16%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 8px 8px',
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 bg-[#3d2314] border-b-4 border-[#180c07] px-3 py-2.5 flex items-center justify-between shadow-md shrink-0">
        {/* Back Button */}
        <button
          type="button"
          aria-label="ย้อนกลับ"
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="wood-box w-9 h-9 rounded-sm flex items-center justify-center text-yellow-300 font-pixel text-lg active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#180c07] cursor-pointer"
        >
          ◀
        </button>

        {/* Title */}
        <div className="flex items-center space-x-1.5 text-center">
          <span className="text-yellow-400 text-xs">✦</span>
          <h1 className="text-[#f9f5ec] font-bold text-base tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            ดูแลต้นไม้
          </h1>
          <span className="text-yellow-400 text-xs">✦</span>
        </div>

        {/* Days Planted Badge */}
        <div className="bg-[#180c07]/80 px-2 py-1 rounded border-2 border-[#5a361e] flex items-center space-x-1">
          <span className="text-xs">🌱</span>
          <span className="text-yellow-400 font-pixel text-[10px]">
            D+{plant.daysPlanted}
          </span>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-20 flex flex-col justify-between no-scrollbar">
        {/* Hero Plant Section */}
        <section className="flex flex-col items-center">
          {/* Plant Name & Edit Pencil Banner */}
          <div className="flex flex-col items-center text-center mt-1 mb-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-[#24140d] tracking-tight">
                {plant.nickname}
              </h2>
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setTempNickname(plant.nickname);
                  setShowEditName(true);
                }}
                className="bg-[#e4cbaf] hover:bg-[#d8be9f] border-2 border-[#180c07] px-2 py-0.5 rounded text-xs text-[#24140d] shadow-[2px_2px_0_#180c07] active:translate-y-0.5 cursor-pointer flex items-center gap-1 font-bold"
                title="แก้ไขชื่อเล่น"
              >
                <span>✎</span>
                <span className="text-[10px]">ตั้งชื่อ</span>
              </button>
            </div>
            <p className="text-xs font-semibold text-[#8a5d3b] tracking-normal mt-0.5">
              {plant.scientificName} • {plant.name}
            </p>
          </div>

          {/* Central Pixel Art Plant Sprite with Pedestal Shadow */}
          <div className="relative w-full max-w-[240px] flex flex-col items-center justify-center my-0.5">
            <span className="absolute top-2 right-6 text-yellow-400 text-base animate-pulse">✦</span>
            <span className="absolute top-10 left-4 text-yellow-400 text-xs animate-bounce">✧</span>
            <img
              src={plant.pixelSprite || ASSETS.pixelMonstera}
              alt={plant.nickname}
              className="w-44 h-44 sm:w-48 sm:h-48 mx-auto object-contain pixelated drop-shadow-md select-none transition-transform hover:scale-105 duration-200"
            />
            <div className="w-32 h-4 bg-[#7a543b]/25 rounded-[50%] blur-[1px] -mt-3.5 border-b border-[#7a543b]/40" />
          </div>

          {/* Badges Row: Plant Match Score & Location (With Location Edit Button) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
            {/* Plant Match Score (Requirement 4 & 9) */}
            <div className="bg-[#f9f5ec] border-2 border-[#180c07] px-3 py-1 rounded-md shadow-[2px_2px_0px_#180c07] flex items-center space-x-1.5">
              <span className="text-emerald-500 text-xs font-bold">🎯</span>
              <span className="text-[11px] font-bold text-[#180c07] font-pixel tracking-wider">
                Plant Match
              </span>
              <span className="bg-[#2ecc71] text-[#180c07] text-[10px] font-black px-1.5 py-0.2 rounded border border-[#1e824c]">
                {plant.plantMatchScore}/100
              </span>
            </div>

            {/* Location (Clickable to Edit) */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowEditLocation(true);
              }}
              className="bg-[#dcc0a3] hover:bg-[#d0b090] border-2 border-[#180c07] px-2.5 py-1 rounded-md shadow-[2px_2px_0px_#180c07] flex items-center space-x-1 text-[#180c07] active:translate-y-0.5 transition-transform cursor-pointer"
              title="แตะเพื่อเปลี่ยนตำแหน่งปลูก"
            >
              <span className="text-xs">📍</span>
              <span className="text-xs font-bold">{plant.location}</span>
              <span className="text-[10px] text-[#784628] font-semibold">({plant.sunlight})</span>
              <span className="text-[10px] text-amber-900 bg-amber-200/80 px-1 rounded ml-0.5">✎ ย้าย</span>
            </button>
          </div>

        </section>

        {/* Plant Tasks Section (Real Tasks for this specific plant) */}
        {plant.identification?.description && <section className="rounded-xl border-2 border-[#4d2a17] bg-[#fffbf0] p-3 text-xs text-[#3e2314] leading-relaxed">
          <h3 className="font-bold mb-1">🌱 คำแนะนำการดูแล{plant.source==='ai'?'จาก AI':''}</h3>
          <p>{plant.identification.description}</p>
          {!!plant.identification.warnings.length && <p className="mt-2 text-amber-900">{plant.identification.warnings.join(' • ')}</p>}
        </section>}
        <section className="w-full">
          <div className="bg-[#fffbf0] border-3 border-[#180c07] rounded-lg p-3 shadow-[3px_3px_0px_#180c07]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#d8be9f] pb-1.5 mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-base">📋</span>
                <h3 className="font-bold text-[#24140d] text-xs sm:text-sm">
                  ภารกิจดูแล: {plant.nickname}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                {plantTasks.filter((t) => !t.isCompleted).length} ภารกิจรอทำ
              </span>
            </div>

            {plantTasks.length > 0 ? (
              <div className="space-y-2">
                {plantTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      task.isCompleted
                        ? 'bg-emerald-50 border-emerald-300 opacity-80'
                        : 'bg-[#f5ecdc] border-[#dfd1b8]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-[#4a2e1b] flex items-center justify-center text-sm text-white shrink-0">
                        {task.icon || '🌱'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#24140d] flex items-center gap-1">
                          <span>{task.title}</span>
                          {task.isCompleted && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-normal">
                              สำเร็จแล้ว ✓
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-[#784628] line-clamp-1">{task.instruction}</p>
                      </div>
                    </div>
                    {!task.isCompleted && onCompleteTask && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (task.kind === 'photo') { onOpenTimeline(plant.id); return; }
                          if (task.kind === 'moisture') { setShowCheckModal(true); return; }
                          if (!await onCompleteTask(task.id)) return;
                          sounds.playSuccess();
                          onShowToast(`ทำภารกิจ "${task.title}" สำเร็จ! ได้รับ ${task.reward} ✨`, '🎉');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 active:scale-90 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-800 shadow-sm shrink-0 ml-1 cursor-pointer"
                      >
                        ทำเสร็จ ✓
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-emerald-800 font-medium bg-emerald-50 rounded border border-emerald-200">
                ✨ ไม่มีภารกิจค้างสำหรับ {plant.nickname} ในขณะนี้ ต้นไม้สดชื่นแข็งแรงดี!
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons: Moisture Check, Timeline, History, Remove */}
        <section className="space-y-2 pt-1">
          {/* Moisture Check Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setShowCheckModal(true);
            }}
            className="w-full bg-[#2ecc71] hover:bg-[#27ae60] active:translate-y-0.5 text-white font-bold py-2.5 px-3 rounded-lg border-2 border-[#180c07] shadow-[0_3px_0_#145a32] flex items-center justify-center space-x-2 text-xs sm:text-sm tracking-wide cursor-pointer"
          >
            <span>💧</span>
            <span>ตรวจบันทึกความชื้นดิน</span>
            <span className="text-yellow-300">✦</span>
          </button>

          {/* Timeline & History Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onOpenTimeline(plant.id);
              }}
              className="bg-[#fffbf0] hover:bg-white text-[#24140d] font-bold py-2 px-2.5 rounded-md border-2 border-[#180c07] shadow-[2px_2px_0px_#180c07] flex items-center justify-center space-x-1.5 text-xs active:translate-y-0.5 cursor-pointer"
            >
              <span>📷</span>
              <span>Timeline ต้นนี้</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowHistoryModal(true);
              }}
              className="bg-[#fffbf0] hover:bg-white text-[#24140d] font-bold py-2 px-2.5 rounded-md border-2 border-[#180c07] shadow-[2px_2px_0px_#180c07] flex items-center justify-center space-x-1.5 text-xs active:translate-y-0.5 cursor-pointer"
            >
              <span>📜</span>
              <span>ประวัติดูแล</span>
            </button>
          </div>

          {/* Remove Plant Button (Bottom Accent) */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowDeleteModal(true);
              }}
              className="text-xs text-rose-800 hover:text-rose-950 font-semibold bg-rose-100/70 hover:bg-rose-200/80 px-3 py-1 rounded-full border border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🗑️</span>
              <span>นำต้นไม้นี้ออกจากสวน</span>
            </button>
          </div>
        </section>
      </main>

      {/* 1. Modal: Edit Nickname */}
      {showEditName && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNickname}
            className="wood-box w-full max-w-[320px] rounded-2xl p-4 text-[#f7edd5] space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>✏️</span> ตั้งชื่อเล่นให้ต้นไม้
              </h3>
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              className="w-full bg-[#180c07] border-2 border-[#5a3624] rounded-lg px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-emerald-500"
              maxLength={20}
              placeholder="พิมพ์ชื่อเล่นต้นไม้..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                className="flex-1 wood-button py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 emerald-btn py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                บันทึกชื่อ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal: Edit Location / ย้ายมุมปลูก */}
      {showEditLocation && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[340px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1.5">
                <span>📍</span> ย้ายตำแหน่งปลูก {plant.nickname}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditLocation(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#ecdcc3]">
              เลือกตำแหน่งใหม่ที่ต้องการย้ายกระถางไปวาง:
            </p>

            <div className="space-y-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.location}
                  type="button"
                  onClick={() => handleSelectLocation(opt.location, opt.sunlight)}
                  className={`w-full p-2.5 rounded-xl border-2 flex items-center justify-between text-left cursor-pointer transition-colors ${
                    plant.location === opt.location
                      ? 'bg-[#1b3d2b] border-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                      : 'bg-[#2b170c] hover:bg-[#3d2012] border-amber-600/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="font-bold text-xs text-amber-200">{opt.location}</p>
                      <p className="text-[10px] text-amber-200/60">{opt.sunlight}</p>
                    </div>
                  </div>
                  {plant.location === opt.location && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                      จุดปัจจุบัน ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Confirm Remove Plant */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[320px] rounded-2xl p-4 text-[#f7edd5] space-y-3 border-2 border-rose-700">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                <span>⚠️</span> นำต้นไม้ออกจากสวน
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#ecdcc3] leading-relaxed">
              คุณต้องการนำ <strong className="text-amber-300">"{plant.nickname}"</strong> ออกจากสวนของคุณใช่หรือไม่?
              บันทึกและประวัติของต้นนี้จะถูกลบออกจากสวน
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 wood-button py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-bold py-2 rounded-xl text-xs border border-rose-900 shadow-md cursor-pointer transition-transform"
              >
                ยืนยันนำออก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Soil Moisture Check */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[340px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>💧</span> บันทึกสภาพความชื้นดิน
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#ecdcc3]">
              เมื่อใช้นิ้วแตะผิวดินลึก 1-2 นิ้ว รู้สึกอย่างไรบ้างครับ?
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectMoisture('dry')}
                className="w-full p-2.5 rounded-xl bg-[#2b170c] hover:bg-[#3d2012] border-2 border-amber-600/50 flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-amber-200">🍂 ดินแห้งสนิท</p>
                  <p className="text-[10px] text-amber-200/60">ไม่มีความชื้นติดนิ้วขึ้นมาเลย</p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  ควรรดน้ำ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMoisture('moist')}
                className="w-full p-2.5 rounded-xl bg-[#162e20] hover:bg-[#1f422e] border-2 border-emerald-500/50 flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-emerald-300">🌱 ดินชุ่มชื้นกำลังดี</p>
                  <p className="text-[10px] text-emerald-200/60">เย็นสบาย ไม่แฉะติดมือ</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  พอเหมาะ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMoisture('wet')}
                className="w-full p-2.5 rounded-xl bg-[#162338] hover:bg-[#1f3250] border-2 border-blue-500/50 flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-blue-300">💦 ดินแฉะมาก</p>
                  <p className="text-[10px] text-blue-200/60">มีน้ำขังหรือดินเปียกเหนียว</p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                  งดรดน้ำ
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: History Log */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[340px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>📜</span> บันทึกการดูแล {plant.nickname}
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs max-h-56 overflow-y-auto"><p>เพิ่มเข้าสวน: {plant.createdAt ? new Date(plant.createdAt).toLocaleDateString('th-TH') : '—'}</p>
              {(plant.careHistory??[]).map(event=><div className="bg-[#180c07] p-2 rounded-lg border border-[#3e2314]" key={event.id}><strong>{event.label}</strong><p>{event.date}</p></div>)}
              {!plant.careHistory?.length&&<p>ยังไม่มีบันทึกการดูแล</p>}
            </div>
            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full emerald-btn py-2 rounded-xl text-white font-bold text-xs cursor-pointer"
            >
              ปิดบันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
