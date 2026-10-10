import crypto from 'crypto';

const configured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const sign = (params) => {
  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${process.env.CLOUDINARY_API_SECRET}`).digest('hex');
};

export const uploadToCloudinary = async ({ file, folder = 'cloud-photo-gallery/library', publicId }) => {
  if (!configured() || !file) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const body = new URLSearchParams({
    file,
    api_key: process.env.CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    folder,
    signature: sign(params),
  });

  if (publicId) body.set('public_id', publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  });

  if (!response.ok) throw new Error('Cloudinary upload failed.');
  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
};

export const deleteFromCloudinary = async (publicId) => {
  if (!configured() || !publicId) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const body = new URLSearchParams({
    public_id: publicId,
    api_key: process.env.CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
    signature: sign(params),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
    method: 'POST',
    body,
  });

  if (!response.ok) throw new Error('Cloudinary delete failed.');
  return response.json();
};
