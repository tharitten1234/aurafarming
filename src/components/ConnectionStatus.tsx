import {useEffect, useState} from 'react';

export function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {window.removeEventListener('online', update);window.removeEventListener('offline', update);};
  }, []);
  return online ? null : <div role="status" aria-live="polite" className="absolute top-0 inset-x-0 z-50 bg-[#3b2012] border-b-2 border-amber-400 text-amber-100 p-3 text-center text-xs">ออฟไลน์ — การสแกนและบันทึกข้อมูลต้องใช้อินเทอร์เน็ต</div>;
}
