import React, {useState,useEffect} from 'react';
import type {Session} from '@supabase/supabase-js';
import {sounds} from '../utils/soundEffects';
import {ASSETS} from '../data/mockData';
import {db,isConfigured} from '../services/supabase';
import {startGuestSession} from '../services/auth';

interface LoginScreenProps {onLoginSuccess:()=>Promise<void>;onShowToast:(msg:string,icon?:string)=>void;}
export const LoginScreen:React.FC<LoginScreenProps>=({onLoginSuccess,onShowToast})=>{
 const [isSignUp,setIsSignUp]=useState(Boolean(sessionStorage.getItem('aurafarming.pending-password'))),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[isLoading,setIsLoading]=useState(false);
 const [passwordSetup,setPasswordSetup]=useState(false);
 const [linkEmailSent,setLinkEmailSent]=useState(false),[emailCode,setEmailCode]=useState('');
 const [googleEnabled,setGoogleEnabled]=useState(false);
 const switchAuthMode=(signUp:boolean)=>{
  if(isLoading||signUp===isSignUp)return;
  setEmail('');setPassword('');setEmailCode('');setShowPassword(false);setIsSignUp(signUp);
 };
 useEffect(()=>{if(!isConfigured)return;const restore=(session:Session|null)=>{if(sessionStorage.getItem('aurafarming.pending-password')===session?.user.id&&session?.user.email_confirmed_at){setPasswordSetup(true);setIsSignUp(true);setEmail(session.user.email??'');}};void db().auth.getSession().then(({data})=>restore(data.session));const {data}=db().auth.onAuthStateChange((_event,session)=>restore(session));return()=>data.subscription.unsubscribe();},[]);
 useEffect(()=>{let active=true;const env=import.meta.env;void fetch(`${env.VITE_SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:env.VITE_SUPABASE_PUBLISHABLE_KEY}}).then(r=>r.json()).then(data=>{if(active)setGoogleEnabled(data.external?.google===true);}).catch(()=>undefined);return()=>{active=false;};},[]);
 const perform=async(action:()=>Promise<void>)=>{if(isLoading)return;setIsLoading(true);try{await action();}catch(e){onShowToast(e instanceof Error?e.message:'เข้าสู่ระบบไม่สำเร็จ','⚠️');}finally{setIsLoading(false);}};
 const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();void perform(async()=>{
  const client=db();
  if(isSignUp){
   const {data:{session}}=await client.auth.getSession();
   if(passwordSetup){
    const {error}=await client.auth.updateUser({password});if(error)throw new Error('ตั้งรหัสผ่านไม่สำเร็จ กรุณาตรวจเงื่อนไขรหัสผ่าน');
    sessionStorage.removeItem('aurafarming.pending-password');await onLoginSuccess();return;
   }
   if(linkEmailSent){
    const {error:verificationError}=await client.auth.verifyOtp({email:email.trim(),token:emailCode.trim(),type:'email_change'});
    if(verificationError)throw new Error('รหัสยืนยันไม่ถูกต้องหรือหมดอายุ กรุณาตรวจอีเมลอีกครั้ง');
    const {error}=await client.auth.updateUser({password});
    if(error)throw new Error('ตั้งรหัสผ่านไม่สำเร็จ กรุณาตรวจเงื่อนไขรหัสผ่าน');
    sessionStorage.removeItem('aurafarming.pending-password');setLinkEmailSent(false);await onLoginSuccess();return;
   }
   if(session?.user.is_anonymous){
    const {error}=await client.auth.updateUser({email:email.trim()},{emailRedirectTo:window.location.origin});
    if(error)throw new Error('สมัครสมาชิกไม่สำเร็จ ตรวจอีเมลและเงื่อนไขรหัสผ่าน');
    sessionStorage.setItem('aurafarming.pending-password',session.user.id);setLinkEmailSent(true);onShowToast('เปิดลิงก์ยืนยันในอีเมล หรือกรอกรหัสยืนยัน แล้วกลับมาตั้งรหัสผ่าน สวนเดิมยังอยู่','📧');return;
   }
   const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}});
   if(error)throw new Error('สมัครสมาชิกไม่สำเร็จ ตรวจอีเมลและเงื่อนไขรหัสผ่าน');
   if(!data.session){onShowToast('ส่งอีเมลยืนยันแล้ว กรุณายืนยันก่อนเข้าสู่ระบบ','📧');return;}
   
  }else{
   const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
   if(error)throw new Error('เข้าสู่ระบบไม่สำเร็จ ตรวจอีเมล รหัสผ่าน และการยืนยันอีเมล');
  }
  sounds.playSuccess();await onLoginSuccess();
 });};
 const handleGuestLogin=()=>void perform(async()=>{await startGuestSession();await onLoginSuccess();});
 const handleGoogleLogin=()=>void perform(async()=>{
  if(!googleEnabled)throw new Error('โปรเจกต์ยังไม่ได้เปิด Google Login กรุณาใช้บัญชีอีเมลหรือ Guest');
  const client=db();const {data:{session}}=await client.auth.getSession();
  const request={provider:'google' as const,options:{redirectTo:window.location.origin,skipBrowserRedirect:true}};
  const {data,error}=session?.user.is_anonymous ? await client.auth.linkIdentity(request) : await client.auth.signInWithOAuth(request);
  if(error||!data.url)throw new Error('Google Login ยังไม่พร้อม กรุณาใช้บัญชีอีเมลหรือ Guest');
  window.location.assign(data.url);
 });
  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar relative select-none bg-[#170c06] text-[#faebd7]">
      {/* Background Pixel Art Ambient Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(#8d5a2b 1.5px, transparent 1.5px),
            radial-gradient(#8d5a2b 1.5px, #170c06 1.5px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Decorative Top Accent Edge */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2c170c] via-[#8d5a2b] to-[#2c170c] border-b border-[#0d0704]" />

      {/* Main Form Container */}
      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col items-center justify-center relative z-10 space-y-4 max-w-[380px] mx-auto w-full">
        {/* Brand Logo & Avatar Header */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#3d2212] border-4 border-[#241309] shadow-[0_6px_0_#140a04] flex items-center justify-center overflow-hidden">
              <img
                src={ASSETS.avatar}
                alt="Farmer Avatar"
                className="w-full h-full object-cover pixelated"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-[#170c06] text-xs shadow-md">
              🌱
            </div>
          </div>

          <div className="pt-1">
            <h1 className="text-2xl font-bold tracking-wider text-[#fedda0] font-pixel drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1.5">
              <span>✦</span>
              <span>AuraFarming</span>
              <span>✦</span>
            </h1>
            <p className="text-xs text-[#d6b490] font-medium tracking-wide mt-0.5">
              สแกนและดูแลพืชสไตล์พิกเซล
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs (เข้าสู่ระบบ / สมัครสมาชิก) */}
        <div className="w-full grid grid-cols-2 bg-[#26140b] p-1 rounded-xl border-2 border-[#452716] shadow-inner text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              switchAuthMode(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-[#5c371d] text-[#fedda0] border border-[#7a4927] shadow-[0_2px_0_#2b170c]'
                : 'text-[#9c7b60] hover:text-[#fedda0]'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              switchAuthMode(true);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              isSignUp
                ? 'bg-[#5c371d] text-[#fedda0] border border-[#7a4927] shadow-[0_2px_0_#2b170c]'
                : 'text-[#9c7b60] hover:text-[#fedda0]'
            }`}
          >
            สร้างบัญชีใหม่
          </button>
        </div>

        {/* Credentials Form Box */}
        <form
          onSubmit={handleSubmit}
          className="w-full wood-box rounded-2xl p-4 space-y-3 shadow-[0_6px_0_#140a04]"
        >
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#ecd6b7] flex items-center gap-1">
              <span>📧</span>
              <span>อีเมล:</span>
            </label>
            <input
              type="email"
              required
              placeholder="farmer@aurafarming.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#160b06] border-2 border-[#522e17] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#faebd7] placeholder-[#7a5940] outline-none font-mono"
            />
          </div>

          {/* Password Field */}
          {linkEmailSent && <div className="space-y-1"><p className="text-xs text-amber-200">เปิดลิงก์ยืนยันอีเมลแล้วกลับมาที่แอป หรือใช้รหัสในอีเมลหากมี</p><input aria-label="รหัสยืนยันอีเมล" placeholder="รหัสยืนยันอีเมล" value={emailCode} onChange={e=>setEmailCode(e.target.value)} className="w-full bg-[#160b06] border-2 border-[#522e17] rounded-xl px-3 py-2 text-xs" /></div>}
          {passwordSetup && <p className="text-xs text-emerald-300">ยืนยันอีเมลแล้ว ตั้งรหัสผ่านเพื่อเก็บสวนเดิมในบัญชีของคุณ</p>}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#ecd6b7] flex items-center gap-1">
                <span>🔑</span>
                <span>รหัสผ่าน:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-amber-300/80 hover:text-amber-200 cursor-pointer"
              >
                {showPassword ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#160b06] border-2 border-[#522e17] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#faebd7] placeholder-[#7a5940] outline-none font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 emerald-btn rounded-xl text-white font-bold text-sm tracking-wide shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </div>
            ) : (
              <>
                <span>✦</span>
                <span>{passwordSetup ? 'ตั้งรหัสผ่านและเข้าสู่สวน' : linkEmailSent ? 'ยืนยันรหัสและตั้งรหัสผ่าน' : isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่สวนของฉัน'}</span>
                <span>✦</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-[#4d2914]" />
          <span className="text-[10px] text-[#a88264] font-semibold">หรือ</span>
          <div className="h-[1px] flex-1 bg-[#4d2914]" />
        </div>

        {/* Alternative Login Actions */}
        <div className="w-full space-y-2">
          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={isLoading || !googleEnabled} onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-[#fdfaf3] hover:bg-white text-stone-900 font-bold text-xs rounded-xl border-2 border-[#2b170c] shadow-[0_3px_0_#2b170c] flex items-center justify-center gap-2 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
              />
            </svg>
            <span>{googleEnabled ? 'เข้าสู่ระบบด้วย Google' : 'Google • รอเปิดใช้ในโปรเจกต์'}</span>
          </button>

          {/* Quick Guest / Demo Play Button */}
          <button
            type="button"
            disabled={isLoading} onClick={handleGuestLogin}
            className="w-full py-2.5 px-4 wood-button text-amber-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
          >
            <span>🎮</span>
            <span>เข้าเล่นทันที (Guest • บันทึกสวนจริง)</span>
          </button>
        </div>

        {/* Footer Settings & Help Link */}
        <div className="flex items-center justify-between w-full pt-1 px-1 text-[11px] text-[#b38d6c]">
          <button
            type="button"
            onClick={() => onShowToast(isConfigured ? 'ใช้ Supabase โปรเจกต์ Aurafarming ที่ตั้งค่าไว้แล้ว' : 'โปรเจกต์ยังไม่ได้ตั้งค่า กรุณาดู README', '⚡')}
            className="hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
          >
            <span>⚡</span>
            <span>{isConfigured ? 'Aurafarming: พร้อมเชื่อมต่อ' : 'ตรวจการตั้งค่าโปรเจกต์'}</span>
          </button>

          <span className="text-[10px] text-amber-200/40">AuraFarming v1.2</span>
        </div>
      </div>

    </div>
  );
};

