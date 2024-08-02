import express, { Request, Response, NextFunction} from 'express';
import * as mongodb from 'mongodb';

import { reviewSchema } from '../models/joiSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { collections } from '../models/database.js';
import { ExpressError } from '../utils/ExpressError.js';

// mergeParams ensure that all params are also going to be merged to params
// in this router. Issue arises when you prefix it in another fle
export const reviewsRouter = express.Router({mergeParams: true});

// Reviews validation using Joi
const validateReview = (req: Request, res: Response, next: NextFunction) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    throw new ExpressError(error.message, 400)
  } else {
    next();
  }
}

// Add a review.
reviewsRouter.post('/', validateReview , asyncHandler((async (req, res) => {
  const campgroundId = req.params.id;
  const review = req.body.review;
  review.rating = parseFloat(review.rating)

  // create review
  const result = await collections.reviews?.insertOne(review)
  const reviewId = result?.insertedId;

  // Update the campground to push the new reviewId into the reviews array
  const reviewedCamp = await collections.campgrounds?.updateOne(
    {_id:new mongodb.ObjectId(campgroundId)}, { $push: {reviews: reviewId}});

  if (reviewedCamp?.modifiedCount === 1) {
    req.flash('success', 'Created a new review!')
    res.redirect(`/campgrounds/${campgroundId}`)
  } else if(reviewedCamp?.matchedCount === 0) {
    res.status(400).send(`Failed to find a Campground: ID ${campgroundId}`);
  }
})))

// Delete a review.
reviewsRouter.delete('/:reviewId', asyncHandler(async (req: Request, res: Response) => {
  const { id, reviewId } = req.params;
  const reviewObjId = new mongodb.ObjectId(reviewId); 
  
  // Delete reference from Campgrounds
  const filter = { _id: new mongodb.ObjectId(id) };
  const queryCamp = {$pull: {reviews: reviewObjId}};
  const resultCamp = await collections.campgrounds?.updateOne(filter, queryCamp);
  
  // Delete the actual review from the reviews collection.
  const result = await collections.reviews?.deleteOne({ _id: reviewObjId })
  if(result?.acknowledged === true && result?.deletedCount ===1 && resultCamp?.modifiedCount === 1) {
    req.flash('success', 'Successfully deleted review and its reference')
    res.redirect(`/campgrounds/${id}`)
  } else {
    console.log('Failed to delete review in reviews collection')
  }
  
}))