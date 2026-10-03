import React, { useState } from 'react';
import { Plant, UserProfile, ScreenType } from '../types';
import { sounds } from '../utils/soundEffects';
import { ASSETS } from '../data/mockData';

interface GardenScreenProps {
  user: UserProfile;
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onWaterPlant: (plantId: string) => Promise<boolean>;
  onShowToast: (msg: string, icon?: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onAddPlant?: (plant: Plant) => Promise<boolean>;
}

const LOCATIONS = [
  { id: 'all', label: 'ทั้งหมด', icon: '🪴' },
  { id: 'ริมหน้าต่าง', label: 'ริมหน้าต่าง', icon: '🪟' },
  { id: 'ระเบียง', label: 'ระเบียง', icon: '🌿' },
  { id: 'ในห้อง', label: 'ในห้อง', icon: '🛋️' },
  { id: 'หน้าบ้าน', label: 'หน้าบ้าน', icon: '🏡' },
];

export const GardenScreen: React.FC<GardenScreenProps> = ({
  user,
  plants,
  onSelectPlant,
  onWaterPlant,
  onShowToast,
  onNavigate,
  onAddPlant,
}) => {
  const [wateringActive, setWateringActive] = useState<string | null>(null);
  const [activeMenuPlant, setActiveMenuPlant] = useState<Plant | null>(null);
  const [lightsSparkle, setLightsSparkle] = useState(false);

  // Collection modal states
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick add plant modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantNickname, setNewPlantNickname] = useState('');
  const [newPlantLocation, setNewPlantLocation] = useState('ริมหน้าต่าง');
  const [newPlantSunlight, setNewPlantSunlight] = useState('แสงรำไร');

  // Single plant water action
  const handleWater = async (e: React.MouseEvent, plant: Plant) => {
    e.stopPropagation();
    sounds.playWater();
    setWateringActive(plant.id);
    if (!await onWaterPlant(plant.id)) { setWateringActive(null); return; }
    setActiveMenuPlant(null);

    setTimeout(() => {
      setWateringActive(null);
    }, 1200);
  };

  // Interactive Watering Can (Right Deck)
  const handleWateringCanClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playWater();
    const thirstyPlants = plants.slice(0, 4).filter((p) => p.careStatus === 'needs-water');
    if (thirstyPlants.length > 0) {
      for (const plant of thirstyPlants) { if (!await onWaterPlant(plant.id)) return; }
    } else {
      onShowToast('บัวรดน้ำพร้อมใช้งาน! ต้นไม้ทุกต้นบนระเบียงสดชื่นดีอยู่แล้วครับ 💧✨', '🪴');
    }
  };

  // Interactive Fairy Lights
  const handleLightsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    setLightsSparkle(true);
    onShowToast('✨ ไฟประดับระเบียงระยิบระยับ ส่องแสงอบอุ่นทั่วสวนดาดฟ้า!', '💡');
    setTimeout(() => setLightsSparkle(false), 2000);
  };

  // Interactive Lantern
  const handleLanternClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    onShowToast('🏮 ตะเกียงไม้อบอุ่น ส่องสว่างมุมพักผ่อนบนระเบียง', '🏮');
  };

  // Handle Quick Add Plant submission
  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    sounds.playSuccess();

    const created: Plant = {
      id: `plant-${Date.now()}`,
      name: newPlantName.trim(),
      scientificName: 'Unknown species',
      nickname: newPlantNickname.trim() || newPlantName.trim(),
      daysPlanted: 1,
      auraScore: 50,
      plantMatchScore: 50,
      location: newPlantLocation,
      sunlight: newPlantSunlight,
      image: ASSETS.monsteraScanned,
      pixelSprite: ASSETS.plant1Thumb,
      potType: 'terracotta',
      features: ['พืชฟอกอากาศ', 'ดูแลง่าย', 'เหมาะกับสภาพแวดล้อม'],
      careStatus: 'happy',
      lastWatered: 'ยังไม่มีบันทึก',
    };


    if (onAddPlant) {
      if (!await onAddPlant(created)) return;
    }
    setShowAddModal(false);
    setNewPlantName('');
    setNewPlantNickname('');
    onShowToast(`เพิ่ม "${created.nickname}" เข้าสู่สวนเรียบร้อย! ✨🪴`, '🎉');
  };

  // Filter plants based on location tab and search query
  const filteredPlants = plants.filter((p) => {
    const matchesLocation = selectedLocation === 'all' || p.location.includes(selectedLocation);
    const matchesQuery =
      searchQuery === '' ||
      p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesQuery;
  });

  // 4 Terrace Pots coordinates matching the 683x1024 pixel art artwork
  const POT_ZONES = [
    { left: '22%', top: '32%', width: '26%', height: '20%' }, // Top-Left: Dieffenbachia
    { left: '52%', top: '32%', width: '26%', height: '20%' }, // Top-Right: Jasmine in blue pot
    { left: '23%', top: '51%', width: '25%', height: '20%' }, // Bottom-Left: Cactus
    { left: '52%', top: '51%', width: '26%', height: '20%' }, // Bottom-Right: Basil in wood crate
  ];

  return (
    <div
      onClick={() => setActiveMenuPlant(null)}
      className="relative w-full h-full overflow-hidden select-none bg-[#190d07]"
    >
      {/* 1. MASTER PIXEL ART ROOFTOP GARDEN SCENE */}
      <div className="garden-scene-art absolute top-0 left-0 w-full overflow-hidden pointer-events-none">
      <img
        src={ASSETS.gardenPixelArt}
        alt="Rooftop Pixel Garden"
        className="w-full h-[126.5823%] object-fill pixelated pointer-events-none select-none block"
      />
      </div>

      <div className="absolute top-[2%] left-[3%] right-[3%] h-[9%] z-20 bg-[#4a2813] border-2 border-[#241309] rounded-xl flex items-center gap-2 px-2 text-xs">
        <img src={user.avatarUrl} alt={user.name} className="h-full py-1 w-10 object-contain pixelated"/><div className="flex-1 truncate"><strong>{user.name}</strong><p>Lv. {user.level} • Aura {user.auraScore}</p></div><span>🪙 {user.coins}<br/>📅 {user.daysStreak} วัน</span>
      </div>
      {plants.length === 0 && <p className="absolute top-[15%] left-[10%] right-[10%] z-20 bg-[#241107]/90 rounded-xl p-2 text-center text-xs">สวนยังไม่มีพืช • แตะสแกนพืชหรือเพิ่มในคลัง 🌱</p>}
      {/* 2. DYNAMIC OVERLAY: Live Coins Display (if updated) */}
      {false && (
        <div
          style={{ left: '59%', top: '4.8%', width: '15%', height: '4%' }}
          className="absolute z-20 flex items-center justify-center bg-[#241107] border border-[#6b3a1d] rounded-md shadow-inner pointer-events-none"
        >
          <span className="font-pixel text-[11px] text-amber-200 tracking-wider font-bold">
            {user.coins}
          </span>
        </div>
      )}

      {/* 3. FLOATING BUTTON: คลังพืชในสวน (View All Plants Collection) */}
      <div className="absolute left-3 top-[76%] sm:top-[74%] z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sounds.playTap();
            setShowCollectionModal(true);
          }}
          className="bg-[#2c170c]/95 hover:bg-[#3d2012] border-2 border-[#f59e0b]/80 hover:border-[#f59e0b] text-[#fedda0] px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer backdrop-blur-[2px]"
          role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="ดูพืชทั้งหมดในสวนและแยกตามตำแหน่งปลูก" title="ดูพืชทั้งหมดในสวนและแยกตามตำแหน่งปลูก"
        >
          <span className="text-sm">🪴</span>
          <span>คลังพืช ({plants.length})</span>
        </button>
      </div>

      {/* 4. TOP BAR INTERACTIVE HITBOXES */}
      {/* Avatar & Profile Hitbox */}
      <div
        style={{ left: '3%', top: '2%', width: '45%', height: '9%' }}
        onClick={(e) => {
          e.stopPropagation();
          sounds.playTap();
          onShowToast(`ผู้ดูแลสวน: ${user.name} (Lv. ${user.level}) 🌿`, '👩‍🌾');
        }}
        className="absolute cursor-pointer z-20 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="โปรไฟล์ผู้ดูแลสวน" title="โปรไฟล์ผู้ดูแลสวน"
      />

      {/* Coins Hitbox */}
      <div
        style={{ left: '56%', top: '2%', width: '20%', height: '9%' }}
        onClick={(e) => {
          e.stopPropagation();
          sounds.playCoin();
          onShowToast(`เหรียญสะสม: ${user.coins} 🪙 (รดน้ำต้นไม้เพื่อสะสมเพิ่ม!)`, '🪙');
        }}
        className="absolute cursor-pointer z-20 rounded-xl hover:bg-amber-300/15 active:bg-amber-300/25 transition-colors"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="ยอดเหรียญสะสม" title="ยอดเหรียญสะสม"
      />

      {/* Streak Hitbox */}
      <div
        style={{ left: '77%', top: '2%', width: '20%', height: '9%' }}
        onClick={(e) => {
          e.stopPropagation();
          sounds.playTap();
          onShowToast(`สตรีคดูแลต่อเนื่อง: ${user.daysStreak} วันแล้ว เก่งมาก! 🔥`, '📅');
        }}
        className="absolute cursor-pointer z-20 rounded-xl hover:bg-emerald-400/15 active:bg-emerald-400/25 transition-colors"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="สตรีคการดูแล" title="สตรีคการดูแล"
      />

      {/* 5. GARDEN SCENE HITBOXES */}
      {/* Fairy Lights (Railing) */}
      <div
        style={{ left: '15%', top: '21%', width: '70%', height: '5.5%' }}
        onClick={handleLightsClick}
        className="absolute cursor-pointer z-20 group"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="แตะเพื่อเปิดไฟประดับระยิบระยับ" title="แตะเพื่อเปิดไฟประดับระยิบระยับ"
      >
        {lightsSparkle && (
          <div className="w-full h-full flex items-center justify-around pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047] animate-ping"
              />
            ))}
          </div>
        )}
      </div>

      {/* Lantern (Left Deck) */}
      <button type="button"
        style={{ left: '10%', top: '25%', width: '12%', height: '9%' }}
        onClick={handleLanternClick}
        className="absolute cursor-pointer z-20 rounded-lg hover:bg-amber-400/20 active:bg-amber-400/35 transition-colors"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="แตะโคมไฟไม้" title="แตะโคมไฟไม้"
      />

      {/* Watering Can (Right Deck) */}
      <div
        style={{ left: '83%', top: '34%', width: '16%', height: '11%' }}
        onClick={handleWateringCanClick}
        className="absolute cursor-pointer z-20 rounded-xl hover:scale-105 active:scale-95 transition-transform group"
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="บัวรดน้ำ (แตะเพื่อรดน้ำทุกกระถาง)" title="บัวรดน้ำ (แตะเพื่อรดน้ำทุกกระถาง)"
      >
        <div className="w-full h-full rounded-xl hover:bg-sky-400/25 active:bg-sky-400/40 transition-colors" />
      </div>

      {/* 4 Plant Pot Interactive Zones */}
      {POT_ZONES.map((zone,index)=> !plants[index] && <button
        key={`empty-${index}`} type="button" aria-label={`กระถางเปล่า ${index+1} เพิ่มพืช`}
        onClick={e=>{e.stopPropagation();sounds.playTap();onNavigate('scanner');}}
        style={{left:zone.left,top:zone.top,width:zone.width,height:zone.height}}
        className="absolute z-10 flex items-end justify-center cursor-pointer group">
        <img src={ASSETS.emptyPot} alt={`กระถางเปล่า ช่อง ${index+1}`} className="w-[92%] h-[78%] object-contain pixelated drop-shadow-[0_8px_3px_rgba(57,28,7,0.25)] group-hover:brightness-110" />
      </button>)}
      {plants.slice(0, 4).map((plant, index) => {
        const zone = POT_ZONES[index] || POT_ZONES[0];
        const isWatering = wateringActive === plant.id;
        const isMenuOpen = activeMenuPlant?.id === plant.id;
        const speciesKnown=Boolean(plant.scientificName && !/unknown species/i.test(plant.scientificName));
        const spritePosition=plant.pixelSprite===ASSETS.plant2Thumb?'100% 0%':plant.pixelSprite===ASSETS.plant3Thumb?'0% 100%':plant.pixelSprite===ASSETS.plant4Thumb?'100% 100%':'0% 0%';

        return (
          <div
            key={plant.id}
            style={{
              left: zone.left,
              top: zone.top,
              width: zone.width,
              height: zone.height,
            }}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playTap();
              setActiveMenuPlant(isMenuOpen ? null : plant);
            }}
            className="absolute cursor-pointer z-20 flex items-center justify-center group"
            role="button" tabIndex={0} aria-label={`ดูแล ${plant.nickname}`}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActiveMenuPlant(isMenuOpen?null:plant);}}}
          >
            {speciesKnown ? <div role="img" aria-label={plant.nickname} className="absolute bottom-0 w-full aspect-square pixelated pointer-events-none drop-shadow-[0_6px_3px_rgba(57,28,7,0.2)]" style={{backgroundImage:`url(${ASSETS.plantsAtlas})`,backgroundSize:'200% 200%',backgroundPosition:spritePosition}}/> : <img src={ASSETS.emptyPot} alt="กระถางที่ยังไม่ระบุชนิดพืช" className="absolute bottom-0 w-[92%] h-[78%] object-contain pixelated pointer-events-none" />}
            <div className="absolute -top-2 bg-[#241107]/90 text-amber-100 px-2 rounded-lg text-[10px] max-w-full truncate">{plant.nickname}</div>
            {/* Subtle Hover Ring */}
            <div className="w-full h-full rounded-2xl group-hover:ring-2 group-hover:ring-amber-300/40 group-hover:bg-amber-300/5 transition-all" />

            {/* Need-Water subtle indicator (Only when thirsty) */}
            {plant.careStatus === 'needs-water' && !isWatering && (
              <div className="absolute -top-3 right-1 bg-blue-500/90 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce pointer-events-none">
                💧
              </div>
            )}

            {/* Water Splash Particles */}
            {isWatering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
                <div className="text-4xl animate-ping">💦</div>
                <div className="font-pixel text-[11px] font-bold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-bounce mt-1">
                  บันทึกการรดน้ำ
                </div>
              </div>
            )}

            {/* Cozy Mini-Menu on Tap */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-[-64px] sm:bottom-[-70px] left-1/2 -translate-x-1/2 w-44 bg-[#2b170c] border-2 border-[#f59e0b] rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between border-b border-[#4d2a17] pb-1">
                  <span className="font-bold text-xs text-[#fedda0]">
                    {plant.nickname}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-pixel bg-[#160c07] px-1 py-0.2 rounded">
                    ✨ Match {plant.plantMatchScore}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleWater(e, plant)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-bold py-1 px-1.5 rounded-lg border border-emerald-400 flex items-center justify-center gap-1 cursor-pointer transition-transform shadow-sm"
                  >
                    <span>💧</span>
                    <span>รดน้ำ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      onSelectPlant(plant);
                    }}
                    className="flex-1 bg-[#b45309] hover:bg-[#d97706] active:scale-95 text-white text-[10px] font-bold py-1 px-1.5 rounded-lg border border-[#f59e0b] flex items-center justify-center gap-1 cursor-pointer transition-transform shadow-sm"
                  >
                    <span>🔍</span>
                    <span>ดูแล</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 7. ALL PLANTS COLLECTION MODAL (ดูพืชทั้งหมด & แยกตามตำแหน่งปลูก) */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3">
          <div className="wood-box w-full max-w-[390px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden text-[#f7edd5] shadow-2xl border-2 border-[#f59e0b]">
            {/* Modal Header */}
            <div className="bg-[#24130a] px-3.5 py-3 border-b-2 border-[#5a3624] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🪴</span>
                <h3 className="font-bold text-sm text-[#fedda0]">
                  คลังพืชของฉัน ({plants.length} กระถาง)
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setShowAddModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded-lg border border-emerald-400 flex items-center gap-0.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>+</span> เพิ่มพืช
                </button>
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="w-7 h-7 bg-[#160c07] hover:bg-[#2b170c] rounded-full text-xs text-amber-200 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-3 pt-2.5 pb-1 shrink-0 bg-[#2b170c]/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 ค้นหาชื่อเล่น หรือสายพันธุ์..."
                className="w-full bg-[#180c07] border border-[#5a3624] rounded-lg px-2.5 py-1.5 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Location Filter Tabs (แยกพืชตามตำแหน่งปลูก) */}
            <div className="px-3 py-2 border-b border-[#4d2a17] shrink-0 bg-[#2b170c]/50">
              <p className="text-[10px] text-amber-200/60 font-medium mb-1.5">
                แยกตามตำแหน่งปลูก:
              </p>
              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {LOCATIONS.map((loc) => {
                  const count =
                    loc.id === 'all'
                      ? plants.length
                      : plants.filter((p) => p.location.includes(loc.id)).length;
                  const isSelected = selectedLocation === loc.id;

                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setSelectedLocation(loc.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                          : 'bg-[#180c07] text-amber-200/80 border-[#4a2e1b] hover:bg-[#24130a]'
                      }`}
                    >
                      <span>{loc.icon}</span>
                      <span>{loc.label}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded-full ${
                          isSelected ? 'bg-emerald-800 text-white' : 'bg-[#2a170d] text-amber-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plants List / Cards */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
              {filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <div
                    key={plant.id}
                    onClick={() => {
                      sounds.playTap();
                      setShowCollectionModal(false);
                      onSelectPlant(plant);
                    }}
                    className="bg-[#24130a] hover:bg-[#2f190e] border-2 border-[#5a3624] hover:border-amber-400/70 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-md"
                  >
                    {/* Plant Thumbnail & Details */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-lg bg-[#180c07] border border-[#6b3e1f] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={plant.pixelSprite || ASSETS.plant1Thumb}
                          alt={plant.nickname}
                          className="w-full h-full object-contain pixelated"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-[#fedda0] group-hover:text-white transition-colors">
                            {plant.nickname}
                          </h4>
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1 rounded font-pixel">
                            ✨ {plant.auraScore}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-200/60 leading-tight mt-0.5">
                          {plant.name} • {plant.scientificName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] bg-[#3a2012] text-amber-200 px-1.5 py-0.2 rounded border border-[#5a3624]">
                            📍 {plant.location}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              plant.careStatus === 'needs-water'
                                ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            }`}
                          >
                            {plant.careStatus === 'needs-water' ? '💧 รอน้ำ' : '❤️ สดชื่น'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Water Button & Inspect Arrow */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleWater(e, plant)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg border border-emerald-400 active:scale-90 transition-transform cursor-pointer shadow-sm flex items-center gap-0.5"
                        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} aria-label="รดน้ำต้นนี้" title="รดน้ำต้นนี้"
                      >
                        <span>💧</span>
                        <span className="hidden sm:inline">รด</span>
                      </button>
                      <span className="text-amber-300 text-xs font-bold">▶</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-amber-200/60">
                  <p className="text-xl mb-1">🍃</p>
                  <p>ไม่พบพืชในตำแหน่ง "{selectedLocation}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setNewPlantLocation(selectedLocation === 'all' ? 'ริมหน้าต่าง' : selectedLocation);
                      setShowAddModal(true);
                    }}
                    className="mt-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg border border-emerald-400"
                  >
                    + เพิ่มพืชลงตำแหน่งนี้
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#180c07] px-3 py-2 border-t border-[#4d2a17] flex items-center justify-between text-[11px] text-amber-200/70">
              <span>แตะที่ต้นไม้เพื่อดูรายละเอียดหรือย้ายตำแหน่ง</span>
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setShowCollectionModal(false);
                  onNavigate('scanner');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>📷</span>
                <span>เปิดกล้องสแกน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. QUICK ADD PLANT MODAL (เพิ่มพืชเข้าสวนด้วยตนเอง) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlant}
            className="wood-box w-full max-w-[320px] rounded-2xl p-4 text-[#f7edd5] space-y-3 border-2 border-emerald-500 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1.5">
                <span>🌱</span> เพิ่มพืชใหม่เข้าสวน
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plant Name */}
            <div>
              <label className="text-[11px] text-amber-200 block mb-1">
                ชื่อสายพันธุ์พืช:
              </label>
              <input
                type="text"
                required
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                placeholder="เช่น กวักมรกต, ลิ้นมังกร, ยางอินเดีย..."
                className="w-full bg-[#180c07] border border-[#5a3624] rounded-lg px-2.5 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Plant Nickname */}
            <div>
              <label className="text-[11px] text-amber-200 block mb-1">
                ชื่อเล่นประจำต้นไม้:
              </label>
              <input
                type="text"
                value={newPlantNickname}
                onChange={(e) => setNewPlantNickname(e.target.value)}
                placeholder="เช่น น้องกวัก, ใบเงินใบทอง..."
                className="w-full bg-[#180c07] border border-[#5a3624] rounded-lg px-2.5 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Location Select */}
            <div>
              <label className="text-[11px] text-amber-200 block mb-1">
                ตำแหน่งที่วางปลูก:
              </label>
              <select
                value={newPlantLocation}
                onChange={(e) => setNewPlantLocation(e.target.value)}
                className="w-full bg-[#180c07] border border-[#5a3624] rounded-lg px-2 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ริมหน้าต่าง">🪟 ริมหน้าต่าง (แสงแดดส่องถึง)</option>
                <option value="ระเบียง">🌿 ระเบียง (แสงมาก แดดตรง)</option>
                <option value="ในห้อง">🛋️ ในห้อง (แสงรำไร)</option>
                <option value="หน้าบ้าน">🏡 หน้าบ้าน (แสงแดดทั้งวัน)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 wood-button py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 emerald-btn py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                เพิ่มเข้าสวน ✨
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};



