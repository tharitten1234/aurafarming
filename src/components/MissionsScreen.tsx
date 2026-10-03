import React, { useState } from 'react';
import { Task } from '../types';
import { sounds } from '../utils/soundEffects';

interface MissionsScreenProps {
  tasks: Task[];
  onBack: () => void;
  onCompleteTask: (taskId: string) => Promise<boolean>;
  onPostponeTask: (taskId: string) => Promise<boolean>;
  onSkipTask: (taskId: string) => Promise<boolean>;
  onShowToast: (msg: string, icon?: string) => void;
  onOpenGrowth: (plantId: string) => void;
  onOpenCare: (plantId: string) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  tasks,
  onBack,
  onCompleteTask,
  onPostponeTask,
  onSkipTask,
  onShowToast,
  onOpenGrowth,
  onOpenCare,
}) => {
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleOpenTask = (task: Task) => {
    sounds.playTap();
    setSelectedTask(task);
  };

  const perform = async (action: (id: string) => Promise<boolean>) => {
    if (!selectedTask || saving) return;
    setSaving(true);
    try { if (await action(selectedTask.id)) { sounds.playSuccess(); setSelectedTask(null); } }
    finally { setSaving(false); }
  };
  const handleCompleteCurrent = () => {
    if (!selectedTask || saving) return;
    if (!selectedTask.isCompleted && selectedTask.kind === 'photo') {
      onOpenGrowth(selectedTask.plantId); setSelectedTask(null); return;
    }
    if (!selectedTask.isCompleted && selectedTask.kind === 'moisture') {
      onOpenCare(selectedTask.plantId); setSelectedTask(null); return;
    }
    return perform(onCompleteTask);
  };
  const handlePostponeCurrent = () => perform(onPostponeTask);
  const handleSkipCurrent = () => perform(onSkipTask);

  return (
    <div className="missions-screen flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative select-none bg-[#f3e6cf]">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#f3e6cf',
          backgroundImage: `
            radial-gradient(#dbc9ad 1.5px, transparent 1.5px),
            radial-gradient(#dbc9ad 1.5px, #f3e6cf 1.5px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Top Header */}
      <header className="pt-3 px-4 pb-2 z-10 shrink-0">
        <div className="bg-[#3e2314] text-[#f7edd5] px-3.5 py-2.5 rounded-xl border-3 border-[#24130a] shadow-[0_4px_0_#24130a] flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            aria-label="ย้อนกลับ"
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-9 h-9 bg-[#5c371d] hover:bg-[#6d4122] active:translate-y-0.5 border-2 border-[#24130a] shadow-[0_2px_0_#24130a] rounded-lg flex items-center justify-center text-amber-200 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs font-bold font-pixel">✦</span>
            <h1 className="text-base font-bold tracking-wide text-[#faefe0]">กระดานภารกิจ</h1>
            <span className="text-amber-400 text-xs font-bold font-pixel">✦</span>
          </div>

          {/* Weekly Badge */}
          <div className="flex items-center gap-1 bg-[#26150b] px-2.5 py-1 rounded-md border border-[#5a3419] shadow-inner text-xs">
            <span className="text-amber-400 font-pixel text-[10px]">{completedCount}/{tasks.length}</span>
          </div>
        </div>
      </header>

      {/* Main Quest Board Area */}
      <main className="flex-1 px-4 pt-1 pb-[calc(var(--navigation-clearance)+16px)] flex flex-col justify-between overflow-y-auto no-scrollbar relative z-10">
        {/* Quest Board Main Frame */}
        <div className="bg-[#734825] border-4 border-[#2b170c] rounded-2xl p-2.5 mt-1 relative shadow-[0_6px_0_rgba(43,23,12,0.4)]">
          {/* Top Plate with Nails */}
          <div className="flex items-center justify-between px-3 py-1 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#201007] border border-[#522e17] flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-0.5 bg-[#8e5c33] rotate-45" />
            </div>

            <div className="bg-[#2e170c] px-4 py-1.5 rounded-lg border-2 border-[#1c0d06] shadow-[0_2px_0_rgba(0,0,0,0.3)] flex items-center gap-2">
              <span className="text-sm">📜</span>
              <span className="text-amber-100 font-bold text-sm tracking-wide">
                ภารกิจประจำสัปดาห์
              </span>
            </div>

            <div className="w-3 h-3 rounded-full bg-[#201007] border border-[#522e17] flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-0.5 bg-[#8e5c33] -rotate-45" />
            </div>
          </div>

          {/* Inner Parchment Area */}
          <div className="bg-[#ecdcc3] border-3 border-[#3c2212] rounded-xl p-3 flex flex-col gap-3 shadow-[inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-3px_0_rgba(0,0,0,0.15)]">
            {/* Progress Header */}
            <div className="bg-[#eedcbf] border-2 border-[#94653e] rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex justify-between items-center text-xs font-semibold text-[#422614]">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-700">🌱</span>
                  <span>ความคืบหน้าภาพรวม</span>
                </span>
                <span className="font-bold font-pixel text-emerald-800 text-[11px] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {completedCount}/{tasks.length} สำเร็จ
                </span>
              </div>

              {/* Pixelated Progress Bar */}
              <div className="w-full h-3.5 bg-[#3a2010] rounded-md p-0.5 border border-[#261307] flex items-center overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-sm border border-emerald-300 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Task Rows */}
            <div className="flex flex-col gap-2.5">
              {!tasks.length && <p className="text-xs text-[#422614] text-center p-3">เพิ่มต้นไม้เข้าสวนเพื่อเริ่มภารกิจ 🌱</p>}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleOpenTask(task)}
                  className={`mission-row rounded-xl p-2.5 cursor-pointer relative group grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 transition-all border-2 ${
                    task.isCompleted
                      ? 'bg-[#eaf6ea] border-[#234e2c] shadow-[0_4px_0_#234e2c]'
                      : 'bg-[#faf3e6] border-[#3e2314] shadow-[0_4px_0_#3e2314] active:translate-y-0.5'
                  }`}
                >
                  {/* Left Pixel Icon */}
                  <div
                    className={`w-10 h-10 row-span-2 border-2 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${
                      task.isCompleted
                        ? 'bg-emerald-100 border-emerald-600'
                        : 'bg-amber-50 border-[#7a4823]'
                    }`}
                  >
                    <span className="text-2xl">{task.icon}</span>
                  </div>

                  {/* Center Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={`text-sm font-bold tracking-tight leading-snug ${
                          task.isCompleted
                            ? 'line-through decoration-emerald-600 decoration-2 text-stone-600'
                            : 'text-[#2e190d]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.isCompleted ? (
                        <span className="bg-emerald-600 text-white font-pixel text-[9px] px-1.5 py-0.2 rounded">
                          ✓
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-medium flex flex-wrap items-center gap-1 mt-0.5">
                      <span>🪴</span>
                      <span className="truncate">{task.plantName}</span>
                      <span className="text-stone-400 text-[10px]">• {task.plantSpecies}</span>
                    </p>
                  </div>

                  {/* Right Reward Badge */}
                  <div className="col-start-2 min-w-0 flex flex-wrap items-center justify-between gap-1">
                    <div className="bg-amber-100 border border-amber-400 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 whitespace-nowrap">
                      <span>✨</span>
                      <span>{task.reward}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        task.isCompleted ? 'text-emerald-700' : 'text-amber-800 flex items-center gap-1'
                      }`}
                    >
                      {task.isCompleted ? (
                        'สำเร็จแล้ว'
                      ) : (
                        <>
                          <span>{task.statusText ?? 'แตะเพื่อดู'}</span>
                          <span className="text-[9px]">›</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gentle Note */}
            <div className="mt-1 bg-[#eedec7] border border-[#a87a52] rounded-lg p-2.5 flex items-start gap-2 text-xs text-[#523018]">
              <span className="text-base leading-none">🍵</span>
              <div className="flex-1">
                <span className="font-bold text-[#3c210e]">
                  ดูแลสบายๆ ตามจังหวะของคุณ:
                </span>
                <p className="text-[11px] text-[#6d4627] mt-0.5 leading-relaxed">
                  ทำภารกิจเมื่อพร้อม หากไม่สะดวกสามารถเลื่อนหรือข้ามได้โดยไม่มีการหักคะแนนใดๆ ต้นไม้ยังคงมีความสุขเสมอ
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="flex justify-between items-center px-2 pt-2 text-[10px] text-[#341b0d] font-semibold">
            <span className="flex items-center gap-1">
              <span>🌾</span> <span>ภารกิจประจำสัปดาห์สำหรับแต่ละต้นไม้</span>
            </span>
            <span className="bg-[#5c371d] text-amber-200 px-2 py-0.5 rounded text-[9px] font-pixel">
              Aura +{tasks.reduce((sum, task) => sum + task.rewardPoints, 0)} รวม
            </span>
          </div>
        </div>
      </main>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#734825] border-4 border-[#2b170c] w-full max-w-[340px] rounded-2xl p-2.5 relative shadow-2xl">
            <div className="bg-[#ecdcc3] border-3 border-[#3c2212] rounded-xl p-3.5 relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#3d2011] border-2 border-[#faefe0] rounded-full text-[#faefe0] font-bold flex items-center justify-center text-xs shadow-md active:scale-95 cursor-pointer"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-[#b58b63]/40">
                <div className="w-12 h-12 bg-amber-100 border-2 border-[#5c371d] rounded-xl flex items-center justify-center text-2xl shadow-inner">
                  {selectedTask.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#2e190d]">
                      {selectedTask.title}
                    </h2>
                    <span className="bg-amber-100 border border-amber-500 text-amber-900 font-pixel text-[10px] px-1.5 py-0.5 rounded">
                      {selectedTask.reward}
                    </span>
                  </div>
                  <p className="text-xs text-[#734825] font-semibold mt-0.5">
                    🪴 สำหรับ: {selectedTask.plantName}
                  </p>
                </div>
              </div>

              {/* Description & Advice */}
              <div className="py-3">
                <p className="text-xs font-bold text-[#442613] mb-1 flex items-center gap-1">
                  <span>📋</span> วิธีการดูแล:
                </p>
                <p className="text-xs text-[#5a361c] bg-[#faefe0] p-2.5 rounded-lg border border-[#c49e79] leading-relaxed">
                  {selectedTask.instruction}
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#694222] bg-[#edd9be] px-2 py-1.5 rounded-md border border-[#c49e79]/60">
                  <span>🌤️</span>
                  <span>{selectedTask.tip}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#b58b63]/30 flex flex-col gap-2">
                {!selectedTask.isCompleted ? (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                  onClick={handleCompleteCurrent}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-bold py-2.5 px-4 rounded-xl border-2 border-[#166534] shadow-[0_4px_0_#14532d] flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <span>✦</span>
                      <span>{selectedTask.actionText}</span>
                      <span>✦</span>
                    </button>

                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        type="button"
                        disabled={saving}
                  onClick={handlePostponeCurrent}
                        className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-[#422513] bg-[#ebd8be] border-2 border-[#3e2314] shadow-[0_3px_0_#3e2314] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5"
                      >
                        <span>⏳</span>
                        <span>เลื่อนไปพรุ่งนี้</span>
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                  onClick={handleSkipCurrent}
                        className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-[#6e4324] bg-[#ebd8be] border-2 border-[#3e2314] shadow-[0_3px_0_#3e2314] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5"
                      >
                        <span>🍃</span>
                        <span>ข้ามสัปดาห์นี้</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 bg-emerald-100 border border-emerald-400 rounded-xl text-emerald-900 font-bold text-xs">
                    ✓ ภารกิจนี้สำเร็จเรียบร้อยแล้วในสัปดาห์นี้
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


