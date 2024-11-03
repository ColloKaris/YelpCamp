import express from 'express';
import multer from 'multer';
// import { v2 as cloudinary} from 'cloudinary';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isLoggedIn, validateCampground} from '../middleware/middleware.js';
import { createCampground, deleteCampground, index, renderEditForm, renderNewForm, showCampground, updateCampground} from '../controllers/campgrounds.js'
import { storage, cloudinary} from '../cloudinary/index.js';

// cloudinary.config(cloudinary_config_options)
const upload = multer({storage: storage})

export const campRouter = express.Router({mergeParams: true});

campRouter.route('/')
  .get(asyncHandler(index))
  .post(isLoggedIn, upload.array('image'), validateCampground, asyncHandler(createCampground));
  // .post( upload.array('image'), async (req,res) => {
  //   try {
  //   for (const file of req.files as Express.Multer.File[]) {
  //     const result = await cloudinary.uploader.upload(file.path, {asset_folder: 'YelpCamp'})
  //     console.log(result)
  //   }
  //   // result.map(f)
  //   res.send('It Worked')
  // } catch(error) {
  //   console.log(cloudinary.config())
  //   console.log(error);
  //   res.send('Error uploading files')
  // }
  // // console.log(req.files)
  // })

campRouter.get('/new', isLoggedIn, renderNewForm);

campRouter.route('/:id')
  .get(asyncHandler(showCampground))
  .put(isLoggedIn, validateCampground, asyncHandler(updateCampground))
  .delete(isLoggedIn, asyncHandler(deleteCampground));

campRouter.get('/:id/edit', isLoggedIn, asyncHandler(renderEditForm));