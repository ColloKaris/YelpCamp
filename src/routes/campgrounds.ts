import express, { Request, Response, NextFunction} from 'express';
import * as mongodb from 'mongodb';

import { campgroundSchema } from '../models/joiSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { collections } from '../models/database.js';
import { Campground } from '../models/campground.js';
import { ExpressError } from '../utils/ExpressError.js';


export const campRouter = express.Router({mergeParams: true});

// Validation middlewares - Campground validation using Joi
const validateCampground = (req: Request, res: Response, next: NextFunction) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    throw new ExpressError(error.message, 400)
  } else {
    next();
  }
}

campRouter.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const campgrounds = await collections.campgrounds?.find({}).toArray();
  res.render('pages/index', { campgrounds });
}));

campRouter.get('/new', (req, res) => {
res.render('pages/new');
});

campRouter.post('/',validateCampground, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
const campground = req.body.campground;
campground.reviews = [];
campground.price = parseFloat(campground.price);
const result = await collections.campgrounds?.insertOne(campground);
if (result?.acknowledged) {
  res.status(201).redirect(`/campgrounds/${result.insertedId}`);
} else {
  res.status(500).send('Failed to create a new campground');
}
}));

campRouter.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const query = { _id: new mongodb.ObjectId(id) };
  const aggregationPipeline = [
    {$match: query},
    {$lookup: {
      from: "reviews",
      localField: "reviews",
      foreignField: "_id",
      as: "campgroundReviews"
    }}
  ]
  
  const campgroundAsArray = await collections.campgrounds?.aggregate(aggregationPipeline).toArray()
  
  if (campgroundAsArray) {
    const campground = campgroundAsArray[0];
    res.render('pages/show', { campground });
  } else {
    res.status(404).send(`Failed to find campground id: ${id}`);
  }
}));

campRouter.get('/:id/edit', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const query = { _id: new mongodb.ObjectId(id) };

  const campground = await collections.campgrounds?.findOne(query);
  res.render('pages/edit', { campground });
}));

campRouter.put('/:id',validateCampground, asyncHandler(async (req:Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const query = { _id: new mongodb.ObjectId(id) };
  // The line below converts price which is a string to a float first
  // all data submitted through forms are sent as strings
  const campground: Campground = { ...req.body.campground, price: parseFloat(req.body.campground.price)};
  const result = await collections.campgrounds?.updateOne(query, {
    $set: campground,
  });

  if (result && result.matchedCount) {
    console.log(`Updated a Campground: ID ${id}.`);
    res.redirect(`/campgrounds/${id}`);
  } else if (result!.matchedCount) {
    res.status(404).send(`Failed to find a Campground: ID ${id}`);
  } else {
    res.status(304).send(`Failed to update Campground: ID ${id}`);
  }
}));

campRouter.delete('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
// Best implementation is to use transactions  
const { id } = req.params;
  const query = { _id: new mongodb.ObjectId(id) };
  
  // Retrieve campground and its id
  const camp = await collections.campgrounds?.findOne(query);
  if (camp) {
    const reviewIds = camp.reviews;
    let reviewDeletion;
    // Delete all reviews
    if (reviewIds.length > 0) {
      reviewDeletion = await collections.reviews?.deleteMany({_id: {$in: reviewIds}})
    }
    // Delete campground.
    const result = await collections.campgrounds?.deleteOne(query);
    if (result?.acknowledged === true && reviewIds.length === reviewDeletion?.deletedCount) {
      console.log("Deleted the campground and its reviews")
      res.redirect('/campgrounds')
    } else {
        console.log("Deletion failed.")
      }
  } else {
    throw new Error("campground not found")
  }
}));