import express from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isLoggedIn, validateCampground} from '../middleware/middleware.js';
import {createCampground, deleteCampground, index, renderEditForm, renderNewForm, showCampground, updateCampground} from '../controllers/campgrounds.js'


export const campRouter = express.Router({mergeParams: true});

campRouter.route('/')
  .get(asyncHandler(index))
  .post(isLoggedIn, validateCampground, asyncHandler(createCampground));

campRouter.get('/new', isLoggedIn, renderNewForm);

campRouter.route('/:id')
  .get(asyncHandler(showCampground))
  .put(isLoggedIn, validateCampground, asyncHandler(updateCampground))
  .delete(isLoggedIn, asyncHandler(deleteCampground));

campRouter.get('/:id/edit', isLoggedIn, asyncHandler(renderEditForm));