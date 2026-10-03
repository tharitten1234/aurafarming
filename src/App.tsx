import { useState, useEffect, useRef } from 'react';
import {
  ScreenType,
  Plant,
  UserProfile,
  PlacementConfig,
  TimelinePhoto,
} from './types';
import type { Task, ScanResult, PlantCandidate } from './types';
import { ensureSession } from './services/auth';
import { db, isConfigured, message } from './services/supabase';
import { analyzePlant } from './services/scans';
import { listPlants, savePlant, renamePlant, recordCare, addManualPlant, placementFromLabels, movePlant, archivePlant } from './services/plants';
import { listMissions, updateMission } from './services/missions';
import { listGrowthLogs, addGrowthLog } from './services/growthLogs';
import { emptyProfile, loadProfile, deriveBadges, updateDisplayName } from './services/profile';
import { sounds } from './utils/soundEffects';
import { Navigation } from './components/Navigation';
import { Toast } from './components/Toast';
import { GardenScreen } from './components/GardenScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { IdentifyScreen } from './components/IdentifyScreen';
import { PlacementScreen } from './components/PlacementScreen';
import { AuraScoreScreen } from './components/AuraScoreScreen';
import { CareDetailScreen } from './components/CareDetailScreen';
import { MissionsScreen } from './components/MissionsScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { FarmSetupScreen } from './components/FarmSetupScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<UserProfile>(emptyProfile);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timelinePhotos, setTimelinePhotos] = useState<TimelinePhoto[]>([]);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [stagedPlant, setStagedPlant] = useState<PlantCandidate | null>(null);
  const [manualChoice, setManualChoice] = useState(false);
  const [placementConfig, setPlacementConfig] = useState<PlacementConfig>({ location: 'window', light: 'medium' });
  const [activeCareId, setActiveCareId] = useState<string | null>(null);
  const activeCarePlant = plants.find(p => p.id === activeCareId);
  const [timelinePlantId, setTimelinePlantId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);
  const scanEpoch = useRef(0);
  const identity = useRef<string|null>(null);
  const identityEpoch = useRef(0);
  const initialization = useRef(0);
  const clearGarden = () => {setPlants([]);setTasks([]);setTimelinePhotos([]);setUser(emptyProfile);setScan(null);setStagedPlant(null);setActiveCareId(null);setTimelinePlantId(undefined);scanEpoch.current++;};
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string | null; icon?: string }>({ message: null });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = (text: string, icon = '✨') => {
    clearTimeout(toastTimer.current);
    setToast({ message: text, icon });
    toastTimer.current = setTimeout(() => setToast({ message: null }), 5000);
  };
  const reload = async () => {
    const session=await ensureSession();const epoch=identityEpoch.current;
    const {error} = await db().rpc('initialize_profile');
    if(error) throw new Error('โหลดข้อมูลสวนไม่สำเร็จ');
    const [nextPlants, nextTasks, nextPhotos] = await Promise.all([listPlants(), listMissions(), listGrowthLogs()]);
    const nextUser = await loadProfile(nextPlants.length, nextTasks.filter(t => t.isCompleted).length);
    const current=await ensureSession();
    if(current.user.id!==session.user.id || epoch!==identityEpoch.current)throw new Error('บัญชีเปลี่ยนแล้ว กรุณาลองใหม่');
    setPlants(nextPlants); setTasks(nextTasks); setTimelinePhotos(nextPhotos.filter(p=>nextPlants.some(plant=>plant.id===p.plantId))); setUser(nextUser);
    return nextUser;
  };
  const initialize = async () => {
    const ticket=++initialization.current;
    setLoading(true); setLoadError(null);
    try {
      const {data,error}=await db().auth.getSession();
      if(ticket!==initialization.current)return;
      if(error) throw new Error('โหลดเซสชันไม่สำเร็จ');
      if(!data.session){setCurrentScreen('login');return;}
      if(identity.current!==data.session.user.id){identity.current=data.session.user.id;identityEpoch.current++;clearGarden();}
      if(sessionStorage.getItem('aurafarming.pending-password')===data.session.user.id&&data.session.user.email_confirmed_at){setCurrentScreen('login');return;}
      const profile=await reload(); if(ticket===initialization.current)setCurrentScreen(screen=>!profile.farmName?'farm-setup':screen==='login'||screen==='farm-setup'?'garden':screen);
    } catch (e) { if(ticket===initialization.current)setLoadError(message(e)); }
    finally { if(ticket===initialization.current)setLoading(false); }
  };
  useEffect(() => {
    void initialize();
    if(!isConfigured)return;
    const {data:{subscription}}=db().auth.onAuthStateChange((event,session)=>{
      if(identity.current!== (session?.user.id??null)){identity.current=session?.user.id??null;identityEpoch.current++;initialization.current++;clearGarden();setCurrentScreen('login');}
      if(event==='SIGNED_OUT'){setCurrentScreen('login');setLoadError(null);setLoading(false);}
      else if(event==='SIGNED_IN'||event==='INITIAL_SESSION') queueMicrotask(()=>void initialize());
    });
    // Refresh private image links before expiry and after returning to the tab.
    const refresh = () => { if (document.visibilityState === 'visible' && !actionLock.current) void db().auth.getSession().then(({data})=>data.session ? reload() : undefined).catch(() => undefined); };
    const timer = setInterval(refresh, 45 * 60 * 1000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => { subscription.unsubscribe(); clearInterval(timer); clearTimeout(toastTimer.current); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); };
  }, []);
  const badges = deriveBadges(user, timelinePhotos.length);
  // Return false on write failure so existing modals stay open for retry.
  const mutate = async (operation: () => Promise<void>, success: string) => {
    if (actionLock.current) return false;
    actionLock.current = true; setBusy(true);
    try {
      await operation();
      try { await reload(); showToast(success); }
      catch { showToast('บันทึกสำเร็จ แต่โหลดข้อมูลล่าสุดไม่ได้ กรุณารีเฟรช', '⚠️'); }
      return true;
    } catch (e) { showToast(message(e), '⚠️'); return false; }
    finally { actionLock.current = false; setBusy(false); }
  };
  const handleScan = async (file: Blob) => {
    if (actionLock.current) return;
    const epoch = ++scanEpoch.current;
    actionLock.current = true; setBusy(true);
    try {
      const result = await analyzePlant(file);
      if (epoch !== scanEpoch.current) return;
      setScan(result); setManualChoice(false); setStagedPlant(result.identification); setCurrentScreen('identify');
    } catch (e) { if (epoch === scanEpoch.current) showToast(message(e), '⚠️'); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const handleWaterPlant = (id: string) => mutate(() => recordCare(id, 'water'), 'บันทึกการรดน้ำแล้ว 💧');
  const handleCompleteTask = (id: string) => mutate(() => updateMission(id, 'completed'), 'บันทึกภารกิจสำเร็จแล้ว 🎉');
  const handlePostponeTask = (id: string) => mutate(() => updateMission(id, 'postponed'), 'เลื่อนภารกิจแล้ว');
  const handleSkipTask = (id: string) => mutate(() => updateMission(id, 'skipped'), 'ข้ามภารกิจแล้ว');
  const handleCompleteMoistureCheck = (id: string, result: 'dry' | 'moist' | 'wet') =>
    mutate(() => recordCare(id, result), result === 'dry' ? 'บันทึกดินแห้งแล้ว ตรวจความเหมาะสมก่อนรดน้ำ' : 'บันทึกความชื้นแล้ว งดรดน้ำเพิ่ม');
  const handleUpdatePlantNickname = (id: string, nickname: string) => mutate(() => renamePlant(id, nickname), 'บันทึกชื่อเล่นแล้ว');
  const handleAddPlantToGarden = async () => {
    if (!scan || !stagedPlant) return;
    const saved = await mutate(() => manualChoice ? addManualPlant(stagedPlant.commonName,stagedPlant.commonName,placementConfig,stagedPlant.scientificName) : savePlant(scan, stagedPlant, placementConfig), 'เพิ่มต้นไม้เข้าสวนแล้ว 🪴');
    if (saved) { setCurrentScreen('garden'); setScan(null); setStagedPlant(null); }
  };
  const handleAddTimelinePhoto = (plantId: string, file: File, note: string, badge: string, careActivity: string, notes: string) =>
    mutate(() => addGrowthLog(plantId, file, note, badge,careActivity,notes), 'บันทึกภาพการเติบโตแล้ว 📷');
  const handleQuickAddPlant = (plant: Plant) => mutate(()=>addManualPlant(plant.name,plant.nickname,placementFromLabels(plant.location,plant.sunlight)),'เพิ่มพืชที่ระบุเองแล้ว 🌱');
  const handleMovePlant = (id: string, location: string, sunlight: string) => mutate(()=>movePlant(id,location,sunlight),'บันทึกตำแหน่งและคำนวณ Match Score ใหม่แล้ว 📍');
  const handleArchivePlant = async (id: string) => { const saved=await mutate(()=>archivePlant(id),'นำพืชออกจากสวนแล้ว 🍃');if(saved)setCurrentScreen('garden');return saved; };
  const handleLoginSuccess = async () => {await initialize();};
  const handleFarmName = async (name:string) => {
    if(actionLock.current)return false;
    actionLock.current=true;setBusy(true);
    try{await updateDisplayName(name);const profile=await reload();if(!profile.farmName)throw new Error('โหลดชื่อฟาร์มไม่สำเร็จ กรุณาลองใหม่');setCurrentScreen('garden');showToast('บันทึกชื่อฟาร์มแล้ว 🌱');return true;}
    catch(e){showToast(message(e),'⚠️');return false;}
    finally{actionLock.current=false;setBusy(false);}
  };
  const handleLogout = async () => {
    if(actionLock.current)return;
    const {data}=await db().auth.getSession();
    // Keep the guest identity so the Guest button restores the same garden.
    if(!data.session?.user.is_anonymous){const {error}=await db().auth.signOut({scope:'local'});if(error){showToast('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่','⚠️');return;}}
    setCurrentScreen('login');
  };
  const handleResetData = async () => { await initialize(); };

  // Screens that show the persistent bottom navigation bar
  const showNav = ['garden', 'missions', 'timeline', 'profile'].includes(
    currentScreen
  );

  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="min-h-screen bg-[#0e0704] flex items-center justify-center p-0 sm:p-4 text-[#faebd7]">
      {/* Toast Feedback */}
      <Toast message={toast.message} icon={toast.icon} />

      {/* Main Mobile Applet Shell (Constrained to mobile portrait viewport 390px - 420px) */}
      <main className="app-shell w-full max-w-[430px] h-[100dvh] sm:w-[min(390px,calc((100dvh-32px)*390/844))] sm:h-[min(844px,calc(100dvh-32px))] bg-[#1a0f09] relative flex flex-col justify-between overflow-hidden shadow-2xl border-0 sm:border-4 border-[#341b10] sm:rounded-3xl">
        {(loading || loadError) && <div className="absolute inset-0 z-40 bg-[#1a0f09] flex items-center justify-center p-6">
          <div className="wood-box rounded-2xl p-5 text-center space-y-4" role="status">
            <p>{loading ? 'กำลังโหลดสวน… 🌱' : loadError}</p>
            {!loading && <button className="emerald-btn px-4 py-2 rounded-xl" onClick={() => void initialize()}>{isConfigured ? 'ลองใหม่' : 'ตรวจการตั้งค่าแล้วลองใหม่'}</button>}
          </div>
        </div>}
        {busy && currentScreen !== 'scanner' && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 wood-box rounded-xl px-3 py-2 text-xs" role="status">กำลังบันทึก…</div>}
        {currentScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} onShowToast={showToast}/>}
        {currentScreen === 'farm-setup' && <FarmSetupScreen onSave={handleFarmName} onLogout={handleLogout}/>}
        {/* SCREEN 1: Garden (Main Hub) */}
        {currentScreen === 'garden' && (
          <GardenScreen
            user={user}
            plants={plants}
            onSelectPlant={(plant) => {
              sounds.playTap();
              setActiveCareId(plant.id);
              setCurrentScreen('care-detail');
            }}
            onWaterPlant={handleWaterPlant}
            onNavigate={setCurrentScreen}
            onAddPlant={handleQuickAddPlant}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 2: Camera Scanner */}
        {currentScreen === 'scanner' && (
          <ScannerScreen
            onBack={() => { scanEpoch.current++; setCurrentScreen('garden'); }}
            onScanComplete={handleScan}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 3: Plant Identification Result ("ใช่ต้นนี้ไหม?") */}
        {currentScreen === 'identify' && scan && (
          <IdentifyScreen
            scannedImage={scan.image}
            result={scan.identification}
            onBack={() => setCurrentScreen('scanner')}
            onRetake={() => setCurrentScreen('scanner')}
            onConfirm={(data,manual) => {
              setStagedPlant(data); setManualChoice(manual);
              setCurrentScreen('placement');
            }}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 4: Plant Placement Setup ("จัดมุมให้น้อง") */}
        {currentScreen === 'placement' && stagedPlant && (
          <PlacementScreen
            plantName={stagedPlant.commonName}
            plantSpecies={stagedPlant.scientificName}
            requirements={stagedPlant}
            onBack={() => setCurrentScreen('identify')}
            onSubmit={(config) => {
              setPlacementConfig(config);
              setCurrentScreen('aurascore');
            }}
          />
        )}

        {/* SCREEN 5: AuraScore Result */}
        {currentScreen === 'aurascore' && stagedPlant && (
          <AuraScoreScreen
            plantName={stagedPlant.commonName}
            plantSpecies={stagedPlant.scientificName}
            requirements={stagedPlant}
            config={placementConfig}
            saving={busy}
            onBack={() => setCurrentScreen('placement')}
            onEditPlacement={() => setCurrentScreen('placement')}
            onAddToGarden={handleAddPlantToGarden}
          />
        )}

        {/* SCREEN 6: Plant Care Detail ("ดูแลต้นไม้") */}
        {currentScreen === 'care-detail' && activeCarePlant && (
          <CareDetailScreen
            plant={activeCarePlant}
            tasks={tasks}
            onUpdateLocation={handleMovePlant}
            onRemovePlant={handleArchivePlant}
            onCompleteTask={handleCompleteTask}
            onBack={() => setCurrentScreen('garden')}
            onUpdateNickname={handleUpdatePlantNickname}
            onCompleteCheck={handleCompleteMoistureCheck}
            onOpenTimeline={() => { setTimelinePlantId(activeCarePlant.id); setCurrentScreen('timeline'); }}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 7: Weekly Missions ("กระดานภารกิจ") */}
        {currentScreen === 'missions' && (
          <MissionsScreen
            tasks={tasks}
            onBack={() => setCurrentScreen('garden')}
            onCompleteTask={handleCompleteTask}
            onPostponeTask={handlePostponeTask}
            onSkipTask={handleSkipTask}
            onOpenGrowth={(id) => { setTimelinePlantId(id); setCurrentScreen('timeline'); }}
            onOpenCare={(id) => { setActiveCareId(id); setCurrentScreen('care-detail'); }}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 8: Growth Timeline ("บันทึกการเติบโต") */}
        {currentScreen === 'timeline' && (
          <TimelineScreen
            plants={plants}
            timelinePhotos={timelinePhotos}
            initialPlantId={timelinePlantId}
            onBack={() => setCurrentScreen('garden')}
            onAddPhoto={handleAddTimelinePhoto}
            onShowToast={showToast}
          />
        )}

        {/* SCREEN 9: Player Profile ("โปรไฟล์ผู้เล่น") */}
        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            badges={badges}
            onBack={() => setCurrentScreen('garden')}
            onResetData={handleResetData}
            onLogout={handleLogout}
            onShowToast={showToast}
          />
        )}

        {/* Persistent Bottom Navigation Bar on Main Tabs */}
        {showNav && (
          <Navigation
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            pendingTasksCount={pendingTasksCount}
          />
        )}
      </main>
    </div>
  );
}
