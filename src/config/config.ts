import dotenv from 'dotenv';

dotenv.config()

const { ATLAS_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

if (!ATLAS_URI || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_KEY || !CLOUDINARY_SECRET) {
  console.error('Missing one or more environment variables');
  process.exit(1);
}

export { ATLAS_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET };