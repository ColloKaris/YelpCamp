import express, { Request, Response, NextFunction} from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isLoggedIn, validateReview } from '../middleware/middleware.js';
import { createReview, deleteReview } from '../controllers/reviews.js';

// mergeParams ensure that all params are also going to be merged to params
// in this router. Issue arises when you prefix it in another fle
export const reviewsRouter = express.Router({mergeParams: true});

// Add a review.
reviewsRouter.post('/', isLoggedIn, validateReview , asyncHandler(createReview))

// Delete a review.
reviewsRouter.delete('/:reviewId', isLoggedIn, asyncHandler(deleteReview))