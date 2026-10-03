import React, { useState, useRef, useEffect } from 'react';
import { message } from '../services/supabase';
import { sounds } from '../utils/soundEffects';

interface ScannerScreenProps {
  onBack: () => void;
  onScanComplete: (image: Blob) => Promise<void>;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onBack,
  onScanComplete,
  onShowToast,
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [useLiveCam, setUseLiveCam] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const selectedFile = useRef<File | null>(null);
  const scanningLock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => () => { if (activeImage) URL.revokeObjectURL(activeImage); }, [activeImage]);
  useEffect(() => {
    let cancelled = false;
    let currentStream: MediaStream | null = null;
    setFlashOn(false);
    const start = async () => {
      if (!useLiveCam) return;
      try {
        if (!window.isSecureContext) throw new Error('เปิดผ่าน HTTPS หรือ localhost เพื่อใช้กล้องสด เลือกรูปหรือถ่ายผ่านปุ่มถ่ายภาพได้');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('เบราว์เซอร์นี้ไม่รองรับกล้องสด กรุณาเลือกรูปหรือถ่ายผ่านปุ่มถ่ายภาพ');
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        currentStream = stream; mediaStreamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch (e) {
        if (cancelled) return;
        const text = e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'ไม่ได้รับอนุญาตใช้กล้อง กรุณาอนุญาตในเบราว์เซอร์ หรือเลือกรูปจากอัลบั้ม'
          : e instanceof DOMException ? 'เปิดกล้องไม่ได้ กล้องอาจไม่พร้อมใช้งาน กรุณาเลือกรูปจากอัลบั้ม'
          : message(e);
        setCameraError(text); setUseLiveCam(false);
      }
    };
    void start();
    return () => { cancelled = true; currentStream?.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; };
  }, [useLiveCam, facingMode]);
  const toggleLiveCam = () => { setCameraError(null); setUseLiveCam(true); };
  const flipCamera = () => { setFacingMode(f => f === 'environment' ? 'user' : 'environment'); setUseLiveCam(true); };
  const toggleFlash = async () => {
    const track = mediaStreamRef.current?.getVideoTracks()[0];
    const capabilities = track?.getCapabilities() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
    if (!track || !capabilities?.torch) { onShowToast('กล้องนี้ไม่รองรับไฟฉาย กรุณาเพิ่มแสงภายนอก', '💡'); return; }
    try { await track.applyConstraints({ advanced: [{ torch: !flashOn } as MediaTrackConstraintSet] }); setFlashOn(!flashOn); }
    catch { onShowToast('เปิดไฟฉายไม่ได้', '💡'); }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 30 * 1024 * 1024) { onShowToast('เลือกภาพขนาดไม่เกิน 30 MB', '⚠️'); return; }
    selectedFile.current = file; setActiveImage(URL.createObjectURL(file)); setUseLiveCam(false); setCameraError(null);
  };
  const handleShutter = async () => {
    if (scanningLock.current) return;
    if (!useLiveCam && !selectedFile.current) { captureInputRef.current?.click(); return; }
    scanningLock.current = true; setIsScanning(true); sounds.playShutter();
    try {
      let image: Blob | null = selectedFile.current;
      if (useLiveCam) {
        const video = videoRef.current;
        if (!video?.videoWidth || !mediaStreamRef.current) throw new Error('กล้องยังไม่พร้อม กรุณารอสักครู่หรือเลือกรูป');
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('ถ่ายภาพไม่ได้ กรุณาเลือกรูป');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        image = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      }
      if (!image) throw new Error('กรุณาเลือกภาพก่อน');
      await onScanComplete(image);
    } catch (e) { if (mounted.current) onShowToast(message(e), '⚠️'); }
    finally { scanningLock.current = false; if (mounted.current) setIsScanning(false); }
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none bg-[#170c06]">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <input type="file" ref={captureInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />
      {/* Top Header */}
      <header className="relative z-30 pt-3 pb-2.5 px-4 bg-[#452715] border-b-4 border-[#2c180e] shadow-md shrink-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#8b5a2b]" />
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            aria-label="ย้อนกลับ"
            disabled={isScanning}
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="w-9 h-9 rounded-lg bg-[#53301c] hover:bg-[#643b23] border-2 border-[#201007] flex items-center justify-center text-[#ffecb3] active:translate-y-0.5 transition-transform shadow-[0_2px_0_#130a05] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current text-[#ffecb3]" viewBox="0 0 24 24">
              <path d="M14 6h-2v2h-2v2H8v2H6v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2h2V8h2V6h2V4z" />
            </svg>
          </button>

          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-base font-bold tracking-wider text-[#ffecb3] drop-shadow-[0_2px_1px_#1b0c05] flex items-center justify-center gap-1.5">
              <span className="text-xs font-pixel text-emerald-400">❖</span>
              <span>สแกนพืช</span>
              <span className="text-xs font-pixel text-emerald-400">❖</span>
            </h1>
            <p className="text-[10px] text-[#cbb094] tracking-normal -mt-0.5">
              AuraFarming Scanner
            </p>
          </div>

          {/* Flash Toggle Button */}
          <button
            type="button"
            aria-label="เปิดไฟฉาย"
            onClick={() => void toggleFlash()}
            className={`w-9 h-9 rounded-lg border-2 border-[#201007] flex items-center justify-center transition-transform active:translate-y-0.5 shadow-[0_2px_0_#130a05] cursor-pointer ${
              flashOn ? 'bg-amber-400 text-stone-900' : 'bg-[#53301c] text-amber-300'
            }`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M11 2h2v6h-2zm0 14h2v6h-2zm8-8h-6v2h6zm-14 0H1v2h4zm11.36-4.95l1.42 1.42-4.24 4.24-1.42-1.42zm-8.48 8.48l1.42 1.42-4.24 4.24-1.42-1.42zm8.48 0l4.24 4.24-1.42 1.42-4.24-4.24zm-8.48-8.48l4.24 4.24-1.42 1.42-4.24-4.24z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Camera Viewfinder Area */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-2 bg-[#170c06]">
        {/* Top Tip Badge */}
        <div className="mb-2 z-20">
          <div className="wood-box px-3.5 py-1.5 rounded-full flex items-center space-x-2 border-2 border-[#543018] shadow-lg">
            <span className="text-emerald-400 text-sm">🌿</span>
            <span className="text-xs text-[#fff4da] font-medium tracking-wide">
              ถ่ายใบหรือดอกให้ชัดเจน
            </span>
            <span className="text-amber-300 text-xs animate-pulse">✨</span>
          </div>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.85)] border-4 border-[#452715] bg-black">
          {useLiveCam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : activeImage ? (
            <img
              src={activeImage}
              alt="พรีวิวต้นไม้ที่จะสแกน"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : <div className="h-full flex items-center justify-center text-center p-8 text-xs text-amber-100">{cameraError ?? 'เลือกรูปจากอัลบั้ม หรือแตะปุ่มถ่ายภาพ'}</div>}

          {/* Reticle Grid Layer Overlay */}
          <div className="absolute inset-0 scan-reticle pointer-events-none opacity-85" />

          {/* 4 Corner Targeting Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-[5px] border-l-[5px] border-[#52c41a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-[5px] border-r-[5px] border-[#52c41a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-[5px] border-l-[5px] border-[#52c41a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-[5px] border-r-[5px] border-[#52c41a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />

          {/* Central Target Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400/80 animate-spin"
                style={{ animationDuration: '10s' }}
              />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
              <div className="absolute top-0 w-0.5 h-2 bg-emerald-400/90" />
              <div className="absolute bottom-0 w-0.5 h-2 bg-emerald-400/90" />
              <div className="absolute left-0 w-2 h-0.5 bg-emerald-400/90" />
              <div className="absolute right-0 w-2 h-0.5 bg-emerald-400/90" />
            </div>
          </div>

          {/* Laser Scanning Bar Animation */}
          {isScanning && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_1s_infinite]" />
          )}

          {/* Sample Switcher Pills on top of viewfinder */}
          <div className="absolute top-2 right-2 z-20 flex gap-1">
            <button
              type="button"
              onClick={flipCamera}
              disabled={isScanning}
              className="bg-black/60 hover:bg-black/80 text-amber-200 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40 backdrop-blur-xs cursor-pointer"
            >
              สลับกล้อง 🔄
            </button>
          </div>
        </div>

        {/* Live Camera Feed Toggle Option */}
        <div className="mt-2.5 z-20 flex items-center justify-between w-full max-w-[340px] px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-[#cbb094] tracking-wider font-medium">
              {isScanning ? 'กำลังอัปโหลดและวิเคราะห์…' : 'พร้อมถ่ายหรือเลือกภาพ'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleLiveCam}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>{useLiveCam ? '📹 กล้องสด' : '📹 เปิดกล้องสด'}</span>
          </button>
        </div>
      </section>

      {/* Bottom Controls Area */}
      <footer className="relative z-30 bg-[#351c0d] border-t-4 border-[#201007] px-6 pt-3 pb-24 shadow-2xl shrink-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#8b5a2b]" />
        <div className="flex items-center justify-between max-w-[320px] mx-auto">
          {/* Left: Choose Image from Gallery */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              aria-label="เลือกรูปภาพจากอัลบั้ม"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 p-2.5 rounded-xl bg-[#4a2b16] border-3 border-[#1f1008] shadow-[0_3px_0_#130a05] flex items-center justify-center text-amber-100 hover:scale-105 active:translate-y-0.5 transition-transform cursor-pointer"
            >
              <svg className="w-6 h-6 fill-current text-[#f7d794]" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h2v2H9V9zm6 7H7l3-4 2 2 3-4 2 3v3h-2z" />
              </svg>
            </button>
            <span className="text-[11px] font-medium text-[#deb887]">เลือกรูป</span>
          </div>

          {/* Center: Primary Camera Shutter Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              aria-label="ถ่ายรูปต้นไม้"
              disabled={isScanning}
              onClick={handleShutter}
              className="pixel-shutter w-18 h-18 rounded-full flex items-center justify-center cursor-pointer group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/90 flex items-center justify-center">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
              </div>
            </button>
          </div>

          {/* Right: Camera Guide Modal Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              aria-label="คำแนะนำการถ่ายภาพ"
              onClick={() => {
                sounds.playTap();
                setShowGuide(true);
              }}
              className="w-12 h-12 p-2.5 rounded-xl bg-[#4a2b16] border-3 border-[#1f1008] shadow-[0_3px_0_#130a05] flex items-center justify-center text-amber-100 hover:scale-105 active:translate-y-0.5 transition-transform cursor-pointer"
            >
              <svg className="w-6 h-6 fill-current text-[#f7d794]" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
              </svg>
            </button>
            <span className="text-[11px] font-medium text-[#deb887]">คู่มือ</span>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="wood-box w-full max-w-[320px] rounded-2xl p-4 text-[#f7edd5] space-y-3">
            <div className="flex items-center justify-between border-b border-[#5a3624] pb-2">
              <h3 className="font-bold text-sm text-[#fedda0] flex items-center gap-1">
                <span>📖</span> คู่มือการสแกนพืช
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-6 h-6 bg-[#160c07] rounded-full text-xs text-amber-200 font-bold"
              >
                ✕
              </button>
            </div>
            <ul className="text-xs space-y-2 text-[#ecdcc3]">
              <li className="flex items-start gap-1.5">
                <span>1.</span>
                <span>ถ่ายภาพในที่ที่มีแสงสว่างเพียงพอ ไม่มืดเกินไป</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span>2.</span>
                <span>ให้ใบ ลำต้น หรือดอก อยู่ตรงกลางกรอบสแกน</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span>3.</span>
                <span>ระบบจะวิเคราะห์สายพันธุ์และคำนวณความเหมาะสมของพื้นที่วาง</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full emerald-btn py-2 rounded-xl text-white font-bold text-xs"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
