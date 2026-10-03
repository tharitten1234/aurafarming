import React, { useState } from 'react';
import { PlacementConfig, PlantCandidate } from '../types';
import { lightLabels } from '../services/auraScore';
import { sounds } from '../utils/soundEffects';

interface PlacementScreenProps {
  plantName: string;
  plantSpecies: string;
  requirements: PlantCandidate;
  onBack: () => void;
  onSubmit: (config: PlacementConfig) => void;
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({
  plantName,
  plantSpecies,
  requirements,
  onBack,
  onSubmit,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<PlacementConfig['location']>('window');
  const [selectedLight, setSelectedLight] = useState<PlacementConfig['light']>('medium');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    sounds.playTap();
    setIsCalculating(true);
    setTimeout(() => {
      sounds.playSuccess();
      onSubmit({
        location: selectedLocation,
        light: selectedLight,
      });
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#1a0e08]">
      {/* Top Header */}
      <header className="w-full pt-3 px-4 pb-2 z-20 shrink-0">
        <div className="header-wood-bevel rounded-2xl px-3 py-2.5 flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            aria-label="ย้อนกลับ"
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-[#2b160c] border-2 border-[#120804] flex items-center justify-center text-amber-200 active:translate-y-0.5 shadow-[inset_1px_1px_0_#582d18,0_2px_0_#0f0602] cursor-pointer"
          >
            <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center space-x-1.5">
            <span className="text-amber-400 text-xs">◆</span>
            <h1 className="text-base font-bold tracking-wide text-[#fffae9] drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
              จัดมุมให้น้อง
            </h1>
            <span className="text-amber-400 text-xs">◆</span>
          </div>

          {/* Step Indicator */}
          <div className="px-2.5 py-1 bg-[#1a0d07] rounded-lg border border-[#4a2614] flex items-center space-x-1 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-300">2/3</span>
          </div>
        </div>

        {/* Mini Plant Summary Card */}
        <div className="mt-2.5 px-3 py-2 bg-[#25130b] rounded-xl border-2 border-[#150a05] flex items-center justify-between shadow-[inset_1px_1px_0_#482414]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3a1d10] border border-[#5d3019] flex items-center justify-center relative overflow-hidden">
              <span className="text-base">🌿</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-[#fef08a]">{plantName}</span>
                <span className="text-[10px] text-amber-200/60 font-light italic truncate max-w-[120px]">
                  {plantSpecies}
                </span>
              </div>
              <p className="text-[10px] text-[#cbd5e1]/80 leading-tight">
                เลือกจุดตั้งต้นไม้เพื่อประเมินความสุข
              </p>
            </div>
          </div>
          <div className="bg-[#170a04] px-2 py-0.5 rounded text-[10px] font-medium text-emerald-400 border border-emerald-900/60 shrink-0">
            พร้อมจัดวาง
          </div>
        </div>
      </header>

      {/* Main Selection Content */}
      <section className="flex-1 px-4 py-1 overflow-y-auto space-y-3.5 no-scrollbar">
        {/* SECTION 1: Location Choices */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">📍</span>
              <h2 className="text-xs font-bold tracking-wide text-amber-200 uppercase">
                1. ตำแหน่งที่วาง
              </h2>
            </div>
            <span className="text-[10px] text-amber-200/50">แตะเพื่อเปลี่ยน</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Option 1: ในห้อง */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLocation('indoor');
              }}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                selectedLocation === 'indoor' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="w-10 h-10 mb-1.5 rounded-lg bg-[#1f1008] border border-[#3e1f10] flex items-center justify-center text-amber-100">
                <svg className="w-6 h-6 text-amber-200/80" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13a3 3 0 0 1 6 0v2H9v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
                </svg>
              </div>
              <span className={`text-xs font-bold ${selectedLocation === 'indoor' ? 'text-white' : 'text-[#fae8b4]'}`}>
                ในห้อง
              </span>
              <span className="text-[9.5px] text-amber-200/50 mt-0.5">ห้องนอน / โต๊ะทำงาน</span>
            </button>

            {/* Option 2: ริมหน้าต่าง */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLocation('window');
              }}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-center text-center relative cursor-pointer transition-all ${
                selectedLocation === 'window' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              {selectedLocation === 'window' && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-black font-extrabold" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 mb-1.5 rounded-lg bg-[#0e3020] border border-[#10b981] flex items-center justify-center text-emerald-300">
                <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="18" rx="2" width="18" x="3" y="3" />
                  <line x1="12" x2="12" y1="3" y2="21" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <circle cx="7.5" cy="7.5" fill="currentColor" r="1.5" />
                </svg>
              </div>
              <span className={`text-xs font-bold ${selectedLocation === 'window' ? 'text-white' : 'text-[#fae8b4]'}`}>
                ริมหน้าต่าง
              </span>
              <span className="text-[9.5px] text-emerald-300/80 mt-0.5">ระบายอากาศดี</span>
            </button>

            {/* Option 3: ระเบียง */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLocation('balcony');
              }}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                selectedLocation === 'balcony' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="w-10 h-10 mb-1.5 rounded-lg bg-[#1f1008] border border-[#3e1f10] flex items-center justify-center text-amber-100">
                <svg className="w-6 h-6 text-amber-200/80" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16M4 18h16M4 22h16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v12M10 10v12M14 10v12M18 10v12" />
                  <circle cx="12" cy="5" r="2.5" />
                </svg>
              </div>
              <span className={`text-xs font-bold ${selectedLocation === 'balcony' ? 'text-white' : 'text-[#fae8b4]'}`}>
                ระเบียง
              </span>
              <span className="text-[9.5px] text-amber-200/50 mt-0.5">คอนโด / อพาร์ตเมนต์</span>
            </button>

            {/* Option 4: หน้าบ้าน */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLocation('porch');
              }}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                selectedLocation === 'porch' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="w-10 h-10 mb-1.5 rounded-lg bg-[#1f1008] border border-[#3e1f10] flex items-center justify-center text-amber-100">
                <svg className="w-6 h-6 text-amber-200/80" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6h.01" />
                </svg>
              </div>
              <span className={`text-xs font-bold ${selectedLocation === 'porch' ? 'text-white' : 'text-[#fae8b4]'}`}>
                หน้าบ้าน
              </span>
              <span className="text-[9.5px] text-amber-200/50 mt-0.5">ชานบ้าน / สวนกลางแจ้ง</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Light Choices */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">☀️</span>
              <h2 className="text-xs font-bold tracking-wide text-amber-200 uppercase">
                2. ระดับแสงแดด
              </h2>
            </div>
            <span className="text-[10px] text-amber-200/50">ส่งผลต่อการเติบโต</span>
          </div>

          <div className="space-y-1.5">
            {/* Light 1: แสงน้อย */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLight('low');
              }}
              className={`w-full rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedLight === 'low' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a0f07] border border-[#3e1f10] flex items-center justify-center text-amber-300/70">
                  <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className={`text-xs font-bold leading-none mb-0.5 ${selectedLight === 'low' ? 'text-white' : 'text-[#fef08a]'}`}>
                    แสงน้อย
                  </div>
                  <div className="text-[10px] text-amber-200/50">ห่างหน้าต่าง / แสงประดิษฐ์</div>
                </div>
              </div>
              <div className="text-xs text-amber-200/40">●○○</div>
            </button>

            {/* Light 2: แสงรำไร */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLight('medium');
              }}
              className={`w-full rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer relative transition-all ${
                selectedLight === 'medium' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#0e3020] border border-[#10b981] flex items-center justify-center text-emerald-300">
                  <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" fill="#fbbf24" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeDasharray="2 2" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-bold leading-none ${selectedLight === 'medium' ? 'text-white' : 'text-[#fef08a]'}`}>
                      แสงรำไร
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[8.5px] font-semibold">
                      แนะนำสำหรับ{plantName}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-200/70 mt-0.5">
                    สว่างโปร่ง ไม่โดนแดดตรง (กรองม่าน)
                  </div>
                </div>
              </div>
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shrink-0">
                <svg className="w-3 h-3 text-black font-extrabold" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </button>

            {/* Light 3: แสงมาก แดดตรง */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedLight('high');
              }}
              className={`w-full rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedLight === 'high' ? 'opt-selected' : 'opt-unselected'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a0f07] border border-[#3e1f10] flex items-center justify-center text-amber-300/70">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className={`text-xs font-bold leading-none mb-0.5 ${selectedLight === 'high' ? 'text-white' : 'text-[#fef08a]'}`}>
                    แสงมาก แดดตรง
                  </div>
                  <div className="text-[10px] text-amber-200/50">แสงแดดส่องกระทบใบโดยตรงทั้งวัน</div>
                </div>
              </div>
              <div className="text-xs text-amber-200/40">●●●</div>
            </button>
          </div>
        </div>

        {/* Farmer Tip Box */}
        <div className="bg-[#1b1009] border border-[#3b1e10] rounded-xl p-2.5 flex items-center space-x-2.5">
          <span className="text-base">💡</span>
          <p className="text-[10.5px] text-[#fde68a]/80 leading-relaxed">
            <strong className="text-emerald-300 font-semibold">ทริกฟาร์เมอร์:</strong>{' '}
            {plantName}: {lightLabels[requirements.sunlightRequirement]} • {requirements.warnings.join(" • ") || "ตรวจดินก่อนรดน้ำ"}
          </p>
        </div>
      </section>

      {/* Sticky Bottom CTA */}
      <footer className="w-full p-4 bg-gradient-to-t from-[#0e0703] via-[#1c0f08] to-transparent pt-3 shrink-0 z-30">
        <button
          type="button"
          disabled={isCalculating}
          onClick={handleCalculate}
          className="w-full primary-rpg-btn py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-extrabold text-base tracking-wide cursor-pointer"
        >
          {isCalculating ? (
            <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>กำลังคำนวณ Aura...</span>
            </div>
          ) : (
            <>
              <span className="text-amber-200 text-sm animate-pulse">✦</span>
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ดู AuraScore</span>
              <span className="text-amber-200 text-sm animate-pulse">✦</span>
            </>
          )}
        </button>

        <div className="mt-2 text-center flex items-center justify-center space-x-1.5 text-[10px] text-[#fed7aa]/60">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>พร้อมวิเคราะห์ความเหมาะสมและรับแต้ม Aura ประจำวัน</span>
        </div>
      </footer>
    </div>
  );
};
