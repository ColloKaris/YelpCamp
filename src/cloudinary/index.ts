import { v2 as cloudinary} from 'cloudinary';
import multer from 'multer';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from '../config/config.js';


// Set config options for cloudinary and export for cloudinary. Configure cloudinary
//const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET} = process.env

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
});

const storage = multer.diskStorage({
  destination: '/tmp/uploads'
})

// Export configured cloudinary and storage
export { cloudinary, storage }