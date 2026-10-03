import React, { useState } from 'react';
import { PlacementConfig, PlantCandidate } from '../types';
import { ASSETS } from '../data/mockData';
import { calculateAuraScore } from '../services/auraScore';
import { sounds } from '../utils/soundEffects';

interface AuraScoreScreenProps {
  plantName: string;
  plantSpecies: string;
  requirements: PlantCandidate;
  saving?: boolean;
  config: PlacementConfig;
  onBack: () => void;
  onEditPlacement: () => void;
  onAddToGarden: (score: number) => void;
}

export const AuraScoreScreen: React.FC<AuraScoreScreenProps> = ({
  plantName,
  plantSpecies,
  config,
  requirements,
  saving,
  onBack,
  onEditPlacement,
  onAddToGarden,
}) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const calculated=calculateAuraScore(requirements,config);
  const {totalScore,lightScore,reasons}=calculated;
  const locationScore=calculated.posScore;
  const suitabilityLevel=totalScore>=80?'เหมาะสมมาก':totalScore>=60?'เหมาะสมปานกลาง':'ควรปรับปรุง';
  const recommendation=reasons.join(' • ');
  const handleAdd = () => {
    sounds.playSuccess();
    onAddToGarden(totalScore);
  };

  const getSuitabilityColor = () => {
    if (suitabilityLevel === 'เหมาะสมมาก') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (suitabilityLevel === 'เหมาะสมปานกลาง') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const getGaugeColor = () => {
    if (totalScore >= 80) return '#10B981';
    if (totalScore >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#F7F3EB] text-[#3D2514]">
      {/* Top Bar */}
      <header className="pt-3 px-4 pb-1 shrink-0 z-10">
        <div className="bg-[#3D2514] text-[#FDFBF7] px-3.5 py-2.5 rounded-2xl flex items-center justify-between border-2 border-[#59381E] shadow-[0_3px_0_#26160A]">
          {/* Back Button */}
          <button
            type="button"
            aria-label="ย้อนกลับ"
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-8 h-8 rounded-lg bg-[#2A170A] hover:bg-[#1E1007] border border-[#59381E] flex items-center justify-center active:translate-y-0.5 transition-transform cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#FBBF24]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-[#FBBF24]">✦</span>
            <h1 className="font-bold text-base tracking-wide text-amber-50">Plant Match Score</h1>
            <span className="text-xs text-[#FBBF24]">✦</span>
          </div>

          {/* Step Pill */}
          <div className="px-2.5 py-1 bg-[#1A0E06] border border-[#59381E] rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-bold text-[#10B981] font-mono tracking-tight">3/3</span>
          </div>
        </div>

        {/* Plant Species Subtitle */}
        <div className="flex items-center justify-center mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DC] border border-[#DECDB7] text-xs text-[#52341E] font-medium shadow-sm">
            <span>🌿</span>
            <span className="font-semibold text-[#3D2514]">{plantName}</span>
            <span className="text-[#8C6D53] text-[11px] italic font-normal">• {plantSpecies}</span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 no-scrollbar">
        {/* Plant Hero Section */}
        <section className="flex flex-col items-center justify-center pt-0.5">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background Retro Glow Aura */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-200/50 via-emerald-100/60 to-yellow-100/70 filter blur-md" />
            {/* Pedestal Shadow */}
            <div className="absolute bottom-1 w-28 h-5 bg-[#D7C4AE] rounded-full border border-[#BFA78D] shadow-inner" />
            {/* Pixel Plant Sprite */}
            <img
              src={ASSETS.pixelMonstera}
              alt="Cozy pixel art plant"
              className="relative z-10 w-32 h-32 object-contain filter drop-shadow-md pixelated animate-[pulse_4s_infinite]"
            />
          </div>
        </section>

        {/* Main Plant Match Score Card (Requirement 4) */}
        <section className="bg-[#FDFBF7] rounded-2xl border-3 border-[#3D2514] p-3.5 relative shadow-[0_4px_0_#26160A]">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getGaugeColor() }} />
              <span className="text-xs font-semibold text-[#66462C]">คะแนนความเหมาะสมของจุดปลูก</span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border ${getSuitabilityColor()}`}>
              <span>{totalScore >= 80 ? '✨' : totalScore >= 60 ? '⛅' : '⚠️'}</span>
              <span>{suitabilityLevel}</span>
            </span>
          </div>

          {/* Gauge & Details */}
          <div className="flex items-center justify-around py-1 px-1">
            {/* Circular Progress Gauge */}
            <div
              className="relative w-24 h-24 rounded-full p-2.5 flex items-center justify-center shadow-sm"
              style={{
                background: `conic-gradient(${getGaugeColor()} 0% ${totalScore * 3.6}deg, #E6D8C3 ${totalScore * 3.6}deg 360deg)`,
              }}
            >
              <div className="w-full h-full bg-[#FDFBF7] rounded-full flex flex-col items-center justify-center border-2 border-[#3D2514]">
                <span className="text-[10px] text-[#8C6D53] -mb-1 font-medium">คะแนน</span>
                <span className="text-2xl font-bold font-mono leading-none" style={{ color: getGaugeColor() }}>
                  {totalScore}
                </span>
                <span className="text-[9px] text-[#A89481]">/100</span>
              </div>
            </div>

            {/* Score Highlights */}
            <div className="flex flex-col justify-center space-y-1.5 max-w-[170px]">
              <div className="flex items-baseline space-x-1">
                <span className="text-base font-bold text-[#3D2514]">Plant Match</span>
                <span className="text-xs font-semibold" style={{ color: getGaugeColor() }}>
                  {totalScore}/100
                </span>
              </div>
              <p className="text-[11px] text-[#6B533E] leading-relaxed">
                {totalScore >= 80
                  ? 'สภาพแวดล้อมตรงตามธรรมชาติของพืชอย่างดีเยี่ยม!'
                  : totalScore >= 60
                  ? 'สภาพแวดล้อมพอเหมาะ ปรับตำแหน่งอีกนิดจะสมบูรณ์แบบ'
                  : 'สภาพแวดล้อมอาจทำให้พืชโตช้าหรือใบเหี่ยว ควรปรับจุดวาง'}
              </p>
              <div className="inline-flex items-center gap-1 bg-[#F4EFE6] text-[#7A5B43] px-2 py-0.5 rounded border border-[#DFD1BD] text-[9.5px]">
                <span>⚖️ แสง 60 + ตำแหน่ง 40</span>
              </div>
            </div>
          </div>
        </section>

        {/* Context-Aware Recommendation Box (Requirement 3 & 4) */}
        <section className="bg-[#F3ECE0] rounded-2xl p-3 border-2 border-[#D9C8B0] shadow-sm space-y-2.5">
          <div className="flex items-start gap-2.5 bg-[#FAF6EE] p-2.5 rounded-xl border border-[#DECBB4]">
            <span className="text-base p-1 bg-amber-100 rounded-lg shrink-0">💡</span>
            <div className="text-xs text-[#52341E] leading-relaxed">
              <span className="font-bold text-[#3D2514]">คำแนะนำตามบริบท (Context-Aware):</span>{' '}
              <p className="mt-0.5 text-[#623c1f]">{recommendation}</p>
            </div>
          </div>

          {/* Breakdown Accordion (Requirement 4) */}
          <div className="text-xs text-[#52341E]">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setBreakdownOpen(!breakdownOpen);
              }}
              className="w-full flex items-center justify-between font-medium text-[#7C5332] hover:text-[#3D2514] px-1 py-0.5 cursor-pointer"
            >
              <span className="flex items-center gap-1 font-semibold">
                <span>✦</span> ดูเหตุผลของคะแนน (Score Reasons)
              </span>
              <span className={`transition-transform text-xs ${breakdownOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {breakdownOpen && (
              <div className="mt-2.5 pt-2 border-t border-[#DECBB4] space-y-2.5 px-1">
                {/* Sunlight score (Max 60 points) */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#52341E] font-medium">☀️ ความเหมาะสมด้านแสง</span>
                    <span className="font-mono font-bold text-[#B45309]">{lightScore} / 60 คะแนน</span>
                  </div>
                  <div className="w-full bg-[#E5D7C2] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F59E0B] h-full rounded-full transition-all"
                      style={{ width: `${(lightScore / 60) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A5B43] mt-1">
                    {reasons[0] || 'ระดับแสงสัมพันธ์กับการสังเคราะห์แสงและการเจริญเติบโต'}
                  </p>
                </div>

                {/* Location score (Max 40 points) */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#52341E] font-medium">📍 ความเหมาะสมตำแหน่งปลูก</span>
                    <span className="font-mono font-bold text-[#10B981]">{locationScore} / 40 คะแนน</span>
                  </div>
                  <div className="w-full bg-[#E5D7C2] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#10B981] h-full rounded-full transition-all"
                      style={{ width: `${(locationScore / 40) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A5B43] mt-1">
                    {reasons[1] || 'ตำแหน่งสัมพันธ์กับการระบายอากาศและความชื้น'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Actions */}
      <footer className="p-4 bg-[#FDFBF7] border-t-2 border-[#E7DCCA] z-10 shrink-0 space-y-2">
        <button
          type="button"
          disabled={saving} onClick={handleAdd}
          className="w-full bg-[#10B981] hover:bg-[#059669] active:translate-y-1 text-white font-bold py-3.5 px-4 rounded-2xl border-2 border-[#047857] shadow-[0_5px_0_#065F46] flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span className="text-yellow-200 text-sm">✦</span>
          <span className="text-base tracking-wide">เพิ่มเข้าสวนของฉัน</span>
          <span className="text-yellow-200 text-sm">✦</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onEditPlacement();
          }}
          className="w-full text-xs text-[#7A5B43] hover:text-[#3D2514] py-1 text-center font-medium cursor-pointer"
        >
          ✎ ปรับเปลี่ยนตำแหน่งหรือแสงอีกครั้ง
        </button>
      </footer>
    </div>
  );
};
