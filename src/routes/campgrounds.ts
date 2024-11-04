import express from 'express';
import multer from 'multer';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isLoggedIn, validateCampground} from '../middleware/middleware.js';
import { createCampground, deleteCampground, index, renderEditForm, renderNewForm, showCampground, updateCampground} from '../controllers/campgrounds.js'
import { storage, cloudinary} from '../cloudinary/index.js';

const upload = multer({storage: storage, limits: {fileSize: 500 * 1024, files: 5}})

export const campRouter = express.Router({mergeParams: true});

campRouter.route('/')
  .get(asyncHandler(index))
  .post(isLoggedIn, upload.array('image'), validateCampground, asyncHandler(createCampground));


campRouter.get('/new', isLoggedIn, renderNewForm);

campRouter.route('/:id')
  .get(asyncHandler(showCampground))
  .put(isLoggedIn, upload.array('image'), validateCampground, asyncHandler(updateCampground))
  .delete(isLoggedIn, asyncHandler(deleteCampground));

campRouter.get('/:id/edit', isLoggedIn, asyncHandler(renderEditForm));