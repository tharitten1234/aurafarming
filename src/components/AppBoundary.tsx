import { Component, type ReactNode } from 'react';

/** Keep unexpected rendering/chunk failures recoverable without clearing the garden. */
export class AppBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="min-h-[100dvh] bg-[#1a0f09] text-[#faebd7] flex items-center justify-center p-6">
      <section role="alert" className="wood-box rounded-2xl p-6 max-w-sm text-center space-y-4">
        <h1 className="text-xl font-bold text-amber-200">กลับเข้าสวนอีกครั้ง</h1>
        <p>แอปแสดงผลไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วโหลดใหม่ ข้อมูลที่บันทึกสำเร็จยังอยู่ในบัญชีของคุณ</p>
        <button type="button" className="emerald-btn rounded-xl px-5 py-3" onClick={()=>window.location.reload()}>โหลดแอปใหม่</button>
      </section>
    </main>;
  }
}
