import { db, check } from './supabase';
import { ensureSession } from './auth';

export const IMAGE_BUCKET = 'plant-images';
export async function compressImage(file: Blob): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.size > 30 * 1024 * 1024)
    throw new Error('เลือกไฟล์ภาพขนาดไม่เกิน 30 MB');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (!img.naturalWidth || !img.naturalHeight) throw new Error();
    const ratio = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error();
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob || blob.size > 5 * 1024 * 1024) throw new Error();
    return blob;
  } catch {
    throw new Error('อ่านภาพไม่ได้ กรุณาเลือกภาพ JPEG, PNG หรือ WebP ที่เปิดได้ในเบราว์เซอร์');
  } finally { URL.revokeObjectURL(url); }
}

export async function signedImage(path: string) {
  const { data, error } = await db().storage.from(IMAGE_BUCKET).createSignedUrl(path, 3600);
  check(error);
  if (!data) throw new Error('โหลดภาพไม่สำเร็จ');
  return data.signedUrl;
}
export async function uploadImage(file: Blob, kind: 'scans' | 'growth' | 'avatars') {
  const session = await ensureSession();
  const blob = await compressImage(file);
  const path = `${session.user.id}/${kind}/${crypto.randomUUID()}.jpg`;
  const { error } = await db().storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg', upsert: false,
  });
  check(error);
  return path;
}
export async function removeImage(path: string) {
  const { error } = await db().storage.from(IMAGE_BUCKET).remove([path]);
  check(error);
}
