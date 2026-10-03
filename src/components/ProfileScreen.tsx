import React, { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { sounds } from '../utils/soundEffects';

interface ProfileScreenProps {
  user: UserProfile;
  badges: Badge[];
  onBack: () => void;
  onLogout?: () => void;
  onResetData: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}


export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  badges,
  onResetData,
  onShowToast,
  onLogout,
}) => {

  const [selectedBadgeId, setSelectedBadgeId] = useState(badges[0]?.id);
  const selectedBadge = badges.find(b => b.id === selectedBadgeId);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const handleSelectBadge = (badge: Badge) => {
    sounds.playTap();
    setSelectedBadgeId(badge.id);
  };

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundEnabled(sounds.enabled);
    if (sounds.enabled) {
      sounds.playTap();
      onShowToast('เปิดเสียงเอฟเฟกต์แล้ว 🎵', '🔊');
    } else {
      onShowToast('ปิดเสียงเอฟเฟกต์แล้ว', '🔇');
    }
  };

  const unlockedCount = badges.filter((b) => b.status === 'unlocked').length;

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#f7f1e5] text-[#2b170c] font-mali">
      {/* Background Dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#f7f1e5',
          backgroundImage: 'radial-gradient(#d6c9b3 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Header */}
      <header className="w-full px-4 pt-3 pb-2 z-10 shrink-0">
        <div className="rounded-xl px-2 py-2 grid grid-cols-[28px_minmax(0,1fr)_28px] items-center text-[#3d2314]">
          <div className="w-7" />
          <div className="flex items-center justify-center gap-1 min-w-0">
            <span className="text-xs text-yellow-300">✦</span>
            <h1 className="text-[15px] sm:text-base font-bold text-[#3d2314] whitespace-nowrap text-center">
              ระบบเกม & โปรไฟล์
            </h1>
            <span className="text-xs text-yellow-300">✦</span>
          </div>

          <button
            type="button"
            aria-label="ตั้งค่าเกม"
            onClick={() => {
              sounds.playTap();
              setShowSettings(true);
            }}
            className="w-7 h-7 rounded-lg pixel-btn-action flex items-center justify-center text-xs text-amber-100 hover:text-white cursor-pointer active:translate-y-0.5"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-1 space-y-3.5 pb-[calc(var(--navigation-clearance)+16px)] relative z-10 no-scrollbar">
        {/* Profile & Gamification Card (Requirement 7) */}
        <section className="bg-[#fdfaf2] border-4 border-[#2b170c] rounded-xl p-3.5 shadow-[0_4px_0_0_#2b170c] relative">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-[3px] border-[#2b170c] bg-[#e8ded0] shadow-[0_3px_0_#4a2e18]">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover pixelated"
                />
              </div>
              <span className="absolute -bottom-1.5 -right-1 bg-emerald-500 border-2 border-[#2b170c] text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold shadow-sm">
                🌱
              </span>
            </div>

            {/* User Info & Cumulative AuraScore */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#2b170c] truncate">
                  {user.name}
                </h2>
                {/* Cumulative AuraScore Pill */}
                <div className="flex items-center gap-1 bg-amber-100 border border-[#b45309] px-2 py-0.5 rounded-full text-xs font-bold text-amber-900 shadow-sm">
                  <span>✨</span>
                  <span>{user.auraScore} Aura</span>
                </div>
              </div>

              {/* Rank / Level Badge */}
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-md bg-[#e3f4e3] border border-[#2e7d32] text-xs font-bold text-[#1b5e20]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Level {user.level} · {user.title}</span>
              </div>

              {/* EXP Progress Bar toward next Level */}
              <div className="mt-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#4a2e18] mb-0.5">
                  <span>AuraScore สะสม</span>
                  <span className="font-mono">
                    {user.exp} / {user.maxExp}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#e8decf] border-2 border-[#2b170c] rounded-full overflow-hidden p-[1px] shadow-inner">
                  <div
                    className="h-full exp-bar-fill rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (user.exp / user.maxExp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Explanatory Banner (Requirement 7) */}
          <div className="mt-3 p-2 bg-[#f4ebe0] rounded-lg border border-[#cbbca9] text-[10.5px] text-[#5c371d] leading-relaxed">
            <span className="font-bold text-emerald-800">💡 ระบบคะแนน AuraScore:</span>{' '}
            เป็นคะแนนสะสมจากการทำภารกิจของผู้เล่น (ไม่ใช่คะแนนสุขภาพของพืช)
            <div className="grid grid-cols-3 gap-1 mt-1 text-[9.5px] text-center font-bold">
              <span className="bg-emerald-100/80 text-emerald-900 py-0.5 rounded border border-emerald-300">
                ทำภารกิจ +10
              </span>
              <span className="bg-purple-100/80 text-purple-900 py-0.5 rounded border border-purple-300">
                บันทึกภาพ +15
              </span>
              <span className="bg-amber-100/80 text-amber-900 py-0.5 rounded border border-amber-300">
                ครบสัปดาห์ +30
              </span>
            </div>
          </div>

          {/* Quick Summary Strip: Care Streak & Stats */}
          <div className="mt-2.5 pt-2 border-t border-[#d8c7b3] grid grid-cols-3 gap-2 text-center text-[#3e2723]">
            <div className="bg-[#f3ece0] py-1 px-1 rounded-lg border border-[#cbbca9]">
              <p className="text-[10px] text-stone-600 font-semibold">พืชในสวน</p>
              <p className="text-xs font-bold text-emerald-800">{user.plantCount} ต้น</p>
            </div>
            <div className="bg-[#fef3c7] py-1 px-1 rounded-lg border border-[#f59e0b]">
              <p className="text-[10px] text-amber-900 font-semibold">Care Streak 🔥</p>
              <p className="text-xs font-bold text-amber-900">{user.daysStreak} วันต่อเนื่อง</p>
            </div>
            <div className="bg-[#f3ece0] py-1 px-1 rounded-lg border border-[#cbbca9]">
              <p className="text-[10px] text-stone-600 font-semibold">ภารกิจสำเร็จ</p>
              <p className="text-xs font-bold text-blue-800">{user.completedTasksCount} ครั้ง</p>
            </div>
          </div>
        </section>

        {/* Badges Section (Requirement 7) */}
        <section className="bg-[#fdfaf2] border-4 border-[#2b170c] rounded-xl p-3.5 space-y-2.5 shadow-[0_4px_0_0_#2b170c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🏆</span>
              <h3 className="text-sm font-bold text-[#2b170c]">เหรียญตราเกียรติยศ (Badges)</h3>
            </div>
            <span className="text-[11px] font-bold bg-[#efe5d5] px-2 py-0.5 rounded-full border border-[#8d6e63] text-[#4e342e]">
              ปลดล็อก {unlockedCount}/{badges.length}
            </span>
          </div>

          <p className="text-[11px] text-stone-600 flex items-center gap-1">
            <span>👆</span> แตะที่เหรียญตราเพื่อดูเงื่อนไขการปลดล็อก
          </p>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {badges.map((badge) => {
              const isSelected = selectedBadge?.id === badge.id;
              const isUnlocked = badge.status === 'unlocked';

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => handleSelectBadge(badge)}
                  className={`rounded-xl p-2.5 flex flex-col items-center text-center relative transition-transform cursor-pointer border-3 ${
                    isSelected ? 'ring-2 ring-emerald-500 scale-105' : ''
                  } ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] border-[#2b170c] shadow-[0_3px_0_#2b170c]'
                      : 'bg-[#ece8e1] border-[#5c4e43] shadow-[0_2px_0_#5f5449] opacity-85'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner mb-1 border-2 ${
                      isUnlocked
                        ? 'bg-amber-200 border-amber-600'
                        : 'bg-stone-300 border-stone-500 grayscale'
                    }`}
                  >
                    <span>{badge.icon}</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold leading-tight ${
                      isUnlocked ? 'text-emerald-900' : 'text-stone-700'
                    }`}
                  >
                    {badge.name}
                  </span>
                  <span
                    className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded-full mt-1 border ${
                      isUnlocked
                        ? 'text-emerald-700 bg-emerald-100 border-emerald-400'
                        : 'text-stone-600 bg-stone-200 border-stone-400'
                    }`}
                  >
                    {badge.progressText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Detail Box */}
          {selectedBadge && (
            <div
              className={`mt-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                selectedBadge.status === 'unlocked'
                  ? 'bg-[#f5ede0] border-[#2e7d32]'
                  : 'bg-[#f0ece5] border-[#5c4e43]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{selectedBadge.icon}</span>
                <span className="text-xs font-bold text-[#2b170c]">{selectedBadge.name}</span>
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedBadge.status === 'unlocked'
                      ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                      : 'text-stone-700 bg-stone-200 border-stone-400'
                  }`}
                >
                  {selectedBadge.statusLabel}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-700 font-medium">
                {selectedBadge.description}
              </p>
            </div>
          )}
        </section>

        {/* Cozy Quote Box */}
        <section className="bg-[#e7decb]/70 border border-[#b8a791] rounded-xl p-3 flex items-center gap-3 text-stone-700 text-xs">
          <div className="text-2xl shrink-0">🏡</div>
          <p className="leading-snug">
            “การดูแลต้นไม้ก็เหมือนการดูแลหัวใจ ค่อยๆ สะสม Aura เติบโตไปด้วยกันนะ!”
          </p>
        </section>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[320px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1.5">
                <span>⚙️</span> การตั้งค่า
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs font-bold text-amber-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#5a3624]/60">
              <span className="text-xs text-[#eed9c4]">เสียงเอฟเฟกต์ (SFX):</span>
              <button
                type="button"
                onClick={toggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-700 text-stone-300'
                }`}
              >
                {soundEnabled ? 'เปิดอยู่ 🔊' : 'ปิดแล้ว 🔇'}
              </button>
            </div>

            <div className="pt-2 space-y-2">
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setShowSettings(false);
                    onLogout();
                  }}
                  className="w-full bg-[#5c371d] hover:bg-[#6d4122] text-[#fedda0] text-xs py-2 rounded-xl border border-[#7a4927] font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🚪</span>
                  <span>ออกจากระบบ (สลับบัญชี)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowSettings(false);
                  onShowToast('กำลังโหลดข้อมูลล่าสุด', '🔄');
                }}
                className="w-full bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs py-2 rounded-xl border border-rose-800 font-semibold cursor-pointer"
              >
                🔄 โหลดข้อมูลล่าสุด
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

