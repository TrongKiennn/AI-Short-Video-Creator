
import { supabase } from '@/supabase/client';
import nextConnect from 'next-connect';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Cho phép multer xử lý multipart/form-data
  },
};

// Cấu hình multer (lưu file trong RAM)
const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error('Lỗi upload:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi upload.' });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Không có file nào được gửi lên.' });
  }

  const ext = path.extname(file.originalname);
  const fileName = `${uuidv4()}${ext}`;

  const { data, error } = await supabase.storage
    .from('frames') // tên bucket trong Supabase
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.error('Lỗi khi upload lên Supabase:', error.message);
    return res.status(500).json({ error: 'Upload thất bại.' });
  }

  const { data: publicUrlData } = supabase.storage.from('frames').getPublicUrl(fileName);
  res.status(200).json({ url: publicUrlData.publicUrl });
});

export default apiRoute;
