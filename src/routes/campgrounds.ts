import express from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isLoggedIn, validateCampground} from '../middleware/middleware.js';
import {createCampground, deleteCampground, index, renderEditForm, renderNewForm, showCampground, updateCampground} from '../controllers/campgrounds.js'


export const campRouter = express.Router({mergeParams: true});

campRouter.get('/', asyncHandler(index));

campRouter.get('/new', isLoggedIn, renderNewForm);

campRouter.post('/', isLoggedIn, validateCampground, asyncHandler(createCampground));

campRouter.get('/:id', asyncHandler(showCampground));

campRouter.get('/:id/edit', isLoggedIn, asyncHandler(renderEditForm));

campRouter.put('/:id', isLoggedIn, validateCampground, asyncHandler(updateCampground));

campRouter.delete('/:id', isLoggedIn, asyncHandler(deleteCampground));