import { v2 as cloudinary } from 'cloudinary';
import connectToDB from '@/lib/db';
import { handler, json, HttpError } from '@/lib/http';
import { requireAdmin } from '@/lib/auth';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's request body limit is 4.5 MB
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const POST = handler(async (req) => {
  await connectToDB();
  await requireAdmin();
  if (!process.env.CLOUDINARY_CLOUD_NAME) throw new HttpError(500, 'Image uploads are not set up (CLOUDINARY_* env vars).');

  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new HttpError(400, 'Choose an image to upload');
  if (!TYPES.includes(file.type)) throw new HttpError(400, 'Use a JPG, PNG, WebP or AVIF image');
  if (file.size > MAX_BYTES) throw new HttpError(400, 'Image must be under 4 MB');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'oneforall/prizes', resource_type: 'image', transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] }, (err, r) => (err ? reject(err) : resolve(r)))
      .end(buffer);
  });
  return json({ url: result.secure_url });
});
