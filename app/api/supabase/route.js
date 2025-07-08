import { supabase } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return new Response(JSON.stringify({ error: 'Không có file.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase();

  // ✅ Đặt file trong thư mục "public/"
  const fileName = `public/${uuidv4()}${ext}`;

  const { data, error } = await supabase.storage
    .from('frames')
    .upload(fileName, buffer, {
      contentType: file.type, // Ví dụ: image/png
    });

  if (error) {
    console.error('Upload lỗi:', error.message);
    return new Response(JSON.stringify({ error: 'Upload thất bại.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from('frames')
    .getPublicUrl(fileName);

  return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
