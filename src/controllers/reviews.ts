import { Request, Response} from 'express';
import * as mongodb from 'mongodb';

import { collections } from '../models/database.js';

export const createReview = (async (req: Request, res: Response) => {
  const campgroundId = req.params.id;
  const review = req.body.review;
  review.rating = parseFloat(review.rating)
  review.author = req.user?.username;

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
})

export const deleteReview = async (req: Request, res: Response) => {
  // Have not implemented logic to protect the backend
  // such that you can't send a request to delete a review they don't own
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
}