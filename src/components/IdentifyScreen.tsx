import React, {useState} from 'react';
import {ASSETS} from '../data/mockData';
import {PLANT_DATABASE} from '../data/plantDatabase';
import {sounds} from '../utils/soundEffects';
import type {PlantCandidate,PlantIdentification} from '../types';
import {candidateFeatures} from '../services/plants';
import {catalogCandidate} from '../services/catalog';
interface IdentifyScreenProps {scannedImage:string;result:PlantIdentification;onBack:()=>void;onConfirm:(candidate:PlantCandidate,manual:boolean)=>void;onRetake:()=>void;onShowToast:(msg:string,icon?:string)=>void;}
type DisplayCandidate={name:string;scientificName:string;confidence:number;confidenceText:string;features:string[];raw:PlantCandidate;manual:boolean;};
const display=(raw:PlantCandidate,manual=false):DisplayCandidate=>({name:raw.commonName,scientificName:raw.scientificName,confidence:Math.round(raw.confidence*100),confidenceText:manual?'ผู้ใช้เลือกเอง':Math.round(raw.confidence*100)+'%',features:candidateFeatures(raw),raw,manual});
export const IdentifyScreen:React.FC<IdentifyScreenProps>=({scannedImage,result:identification,onBack,onConfirm,onRetake,onShowToast})=>{
 const isAnalyzing=false;
 const result={primary:display(identification),alternatives:identification.alternativeCandidates.map(p=>display(p)),isUnclear:identification.confidence<.6,unclearReason:identification.isPlant?'Pl@ntNet ให้ความมั่นใจต่ำ กรุณาถ่ายใบหรือดอกให้ชัดขึ้น และตรวจชนิดพืชก่อนใช้คำแนะนำการดูแล':'ภาพนี้ไม่พบพืช กรุณาถ่ายภาพใหม่'};
 const [selectedPlant,setSelectedPlant]=useState<DisplayCandidate>(result.primary);
 const [showSearchModal,setShowSearchModal]=useState(false),[searchQuery,setSearchQuery]=useState('');
 const handleConfirm=()=>{if(!selectedPlant.manual&&(!identification.isPlant||!selectedPlant.scientificName))return;onConfirm(selectedPlant.raw,selectedPlant.manual);};
 const handleSelectCandidate=(candidate:DisplayCandidate)=>{sounds.playTap();setSelectedPlant(candidate);};
 const isLowConfidence=!selectedPlant.manual&&(selectedPlant.confidence<60||!identification.isPlant);
 const top3Candidates=[result.primary,...result.alternatives].filter(c=>c.scientificName).slice(0,3);
  return (
    <div className="identify-screen flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative select-none bg-[#1a0f09]">
      {/* Decorative Top Edge */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2c170c] via-[#6d4223] to-[#2c170c] border-b border-[#0d0704]" />

      {/* Top Header */}
      <header className="w-full px-3 pt-2 pb-1 flex items-center justify-between gap-2 z-10 shrink-0">
        {/* Back Button */}
        <button
          type="button"
          aria-label="ย้อนกลับ"
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="w-9 h-9 wood-button rounded-xl flex items-center justify-center text-[#e9cca4] hover:text-[#fff] cursor-pointer"
        >
          <svg className="w-5 h-5 drop-shadow" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Center Title */}
        <div className="flex items-center space-x-1.5">
          <span className="pixel-sparkle" />
          <h1 className="text-sm font-bold text-[#fedda0] text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            ผลการระบุชนิดพืช
          </h1>
          <span className="pixel-sparkle" />
        </div>

        {/* Recognition provider */}
        <div className="px-2 py-1 bg-[#12281a] border border-[#235e38] rounded-xl flex items-center gap-1 text-[10px] text-[#8bf7be]">
          <span>🌿</span>
          <span className="font-semibold">Pl@ntNet</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="min-h-0 px-3 py-2 flex-1 flex flex-col items-center justify-start space-y-3 overflow-y-auto no-scrollbar">
        {/* Loading AI State */}
        {isAnalyzing ? (
          <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <span className="absolute text-3xl animate-bounce">🌿</span>
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-sm text-emerald-300 font-pixel">Pl@ntNet ANALYZING...</p>
              <p className="text-xs text-[#d8be9f]">กำลังส่งภาพไปวิเคราะห์สายพันธุ์และคำนวณค่าความมั่นใจ</p>
            </div>
          </div>
        ) : (
          <>
            {/* Scanned Plant Photo Card */}
            <section className="w-full relative mt-1" data-purpose="plant-photo-card">
              <div className="wood-box rounded-2xl p-2.5 relative">
                <div className="relative w-full h-[clamp(150px,28dvh,220px)] rounded-xl overflow-hidden border-2 border-[#160b06] shadow-inner bg-[#0e0704]">
                  <img
                    src={scannedImage || ASSETS.monsteraScanned}
                    alt="ภาพถ่ายต้นไม้ที่สแกน"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Retro Viewfinder Corner Accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3ce385] opacity-80 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3ce385] opacity-80 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3ce385] opacity-80 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3ce385] opacity-80 pointer-events-none" />
                </div>

                {/* AI Confidence Badge */}
                <div
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full flex items-center space-x-1.5 shadow-lg border-2 ${
                    isLowConfidence
                      ? 'bg-rose-950 border-rose-500 text-rose-300'
                      : selectedPlant.confidence >= 80
                      ? 'bg-[#114227] border-[#2ae07d] text-[#8bf7be]'
                      : 'bg-amber-950 border-amber-500 text-amber-300'
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                      isLowConfidence ? 'bg-rose-400' : selectedPlant.confidence >= 80 ? 'bg-[#3ce385]' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                    {selectedPlant.manual ? '' : isLowConfidence ? 'Pl@ntNet ความมั่นใจต่ำ ' : 'Pl@ntNet มั่นใจ '}
                    {selectedPlant.confidenceText}
                  </span>
                </div>
              </div>
            </section>

            {/* RETAKE RECOMMENDATION BANNER (หากค่าความมั่นใจต่ำกว่า 60% ให้แนะนำให้ถ่ายภาพใหม่) */}
            {isLowConfidence && (
              <section className="w-full bg-[#3a1a12] border-2 border-amber-600 rounded-xl p-3 shadow-lg flex flex-col gap-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-xs text-amber-200">
                      ค่าความมั่นใจต่ำกว่า 60% แนะนำให้ถ่ายภาพใหม่
                    </h3>
                    <p className="text-[11px] text-[#eed9c4] leading-relaxed mt-0.5">
                      {result?.unclearReason ||
                        'ภาพอาจจะมืดเกินไป เบลอ หรือมุมกล้องไกลเกินไปจนไม่เห็นลวดลายใบชัดเจน'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      onRetake();
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-[#24130a] font-bold text-xs py-1.5 px-2 rounded-lg border border-amber-300 flex items-center justify-center gap-1 cursor-pointer transition-transform shadow-md"
                  >
                    <span>📷</span>
                    <span>ถ่ายภาพใหม่อีกครั้ง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setShowSearchModal(true);
                    }}
                    className="bg-[#24130a] hover:bg-[#341b0e] text-amber-200 font-semibold text-xs py-1.5 px-3 rounded-lg border border-amber-700/80 cursor-pointer"
                  >
                    <span>🔎 เลือกชื่อเอง</span>
                  </button>
                </div>
              </section>
            )}

            {/* Selected Plant Headline Details */}
            <section className="w-full text-center pt-1 flex flex-col items-center">
              <h2 className="text-lg font-bold text-[#faebd7] break-words max-w-full tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {selectedPlant.name}
              </h2>
              <p className="text-xs italic text-[#d4af37] font-medium tracking-wide mt-0.5">
                {selectedPlant.scientificName}
              </p>

              {/* Plant Attribute Tags / Pixel Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-2 w-full">
                {selectedPlant.features.map((feat, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-[#23140c] border border-[#4d2a17] text-[#fedda0] text-[11px] font-medium flex items-center space-x-1 shadow-sm"
                  >
                    <span>{i === 0 ? '✨' : i === 1 ? '🌱' : '⛅'}</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </section>

            {(selectedPlant.manual || identification.isPlant) && selectedPlant.raw.description && (
              <section className="w-full rounded-xl border border-[#4d2a17] bg-[#23140c] p-3 text-xs text-[#eed9c4] leading-relaxed">
                <h3 className="font-semibold text-[#fedda0] mb-1">🌱 {selectedPlant.manual ? 'คำแนะนำจากฐานข้อมูลพืช' : 'ชื่อไทยและคำแนะนำการดูแลจาก Gemini'}</h3>
                <p>{selectedPlant.raw.description}</p>
              </section>
            )}

            {/* Top 3 recognition candidates */}
            <section className="w-full space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#fedda0] flex items-center gap-1">
                  <span>🏆</span> ผลลัพธ์ที่คล้ายกันจาก Pl@ntNet
                </span>
                <span className="text-[10px] text-amber-200/50">แตะเพื่อเลือก</span>
              </div>

              <div className="space-y-1.5">
                {top3Candidates.map((cand, idx) => {
                  const isSelected = selectedPlant.name === cand.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectCandidate(cand)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#2b170c] border-[#3ce385] shadow-[0_0_8px_rgba(60,227,133,0.25)]'
                          : 'bg-[#1e1008] border-[#3d2010] hover:bg-[#28150a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-500 text-stone-900 font-pixel'
                              : idx === 1
                              ? 'bg-stone-300 text-stone-900 font-pixel'
                              : 'bg-amber-800 text-amber-200 font-pixel'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#faebd7] flex items-center gap-1">
                            <span>{cand.name}</span>
                            {isSelected && <span className="text-[#3ce385] text-[10px]">✓</span>}
                          </p>
                          <p className="text-[10.5px] italic text-[#9c7d67]">
                            {cand.scientificName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                            cand.confidence >= 60
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {cand.confidenceText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Bottom Action Section */}
      <footer className="w-full px-3 pt-2 pb-3 bg-gradient-to-t from-[#140a06] via-[#1a0f09] to-transparent flex flex-col items-center space-y-2 shrink-0">
        {/* Primary Action Button: Confirm */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isAnalyzing || (!selectedPlant.manual && (!identification.isPlant || !selectedPlant.scientificName))}
          className="w-full py-2.5 px-3 emerald-btn rounded-xl flex items-center justify-center space-x-2 text-white font-bold text-sm shadow-lg cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            ยืนยันเลือกพืชนี้
          </span>
        </button>

        {/* Secondary Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Retake Photo Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onRetake();
            }}
            className="wood-button py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs font-medium text-[#f1d8be] cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#e6b986]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>ถ่ายใหม่</span>
          </button>

          {/* Manual Select Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setShowSearchModal(true);
            }}
            className="wood-button py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs font-medium text-[#f1d8be] cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#e6b986]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>เลือกจากฐานข้อมูล</span>
          </button>
        </div>

        <p className="text-[10px] text-amber-200/60">AI เป็นค่าประเมิน • การเลือกชื่อเองไม่ได้ยืนยันชนิดพืชจากภาพ</p>
      </footer>

      {/* Manual Search Modal from 15-species database */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[340px] rounded-2xl p-4 space-y-3 text-[#faebd7]">
            <div className="flex items-center justify-between border-b border-[#4d2a17] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1.5">
                <span>📚</span> ฐานข้อมูลพืช 15 ชนิด
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs font-bold text-amber-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="พิมพ์ชื่อไทย หรือวิทยาศาสตร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#160b06] border border-[#522e17] rounded-lg px-3 py-2 text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="space-y-1.5 max-h-56 overflow-y-auto text-xs no-scrollbar">
              {PLANT_DATABASE.filter(
                (p) =>
                  p.thaiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setSelectedPlant(display(catalogCandidate(p), true));
                    setShowSearchModal(false);
                    onShowToast(`เลือกสายพันธุ์ "${p.thaiName}" เรียบร้อยแล้ว ✨`, '🌿');
                  }}
                  className="w-full p-2.5 rounded-lg bg-[#24130a] hover:bg-[#341b0e] border border-[#4d2a17] flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-bold text-xs text-[#fedda0]">{p.thaiName}</p>
                    <p className="text-[10px] text-amber-200/60 italic">{p.scientificName}</p>
                    <p className="text-[9.5px] text-emerald-400 mt-0.5">แสงที่ชอบ: {p.optimalLight}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold shrink-0">
                    เลือก
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
