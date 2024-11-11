import {Request, Response, NextFunction} from 'express';
import * as mongodb from 'mongodb';
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding-v6.js";


import { collections } from '../models/database.js';
import { Campground } from '../models/campground.js';
import { cloudinary} from '../cloudinary/index.js';

const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN as string});

export const index = async (req: Request, res: Response, next: NextFunction) => {
  const campgrounds = await collections.campgrounds?.find({}).toArray();
  res.render('pages/index', { campgrounds });
}

export const renderNewForm = (req: Request, res: Response) => {
  res.render('pages/new');
}

export const createCampground = async (req: Request, res: Response, next: NextFunction) => {
  const geoData = await geocoder.forwardGeocode({query: req.body.campground.location, limit: 1}).send()
    
  const campground = req.body.campground;
  campground.reviews = [];
  campground.images = [];
  campground.price = parseFloat(campground.price);
  campground.author = req.user?._id;
  campground.geometry = geoData.body.features[0].geometry

  // Upload image to cloudinary
  for (const file of req.files as Express.Multer.File[]) {
    const result = await cloudinary.uploader.upload(file.path, {asset_folder: 'YelpCamp'})
    const imageObject = {
      url: result.secure_url,
      public_id: result.public_id
    }
    campground.images.push(imageObject)
  }

  // Add the campground to the database
  const result = await collections.campgrounds?.insertOne(campground);
  if (result?.acknowledged) {
    req.flash('success', 'Successfully made a new campground');
    res.status(201).redirect(`/campgrounds/${result.insertedId}`);
  } else {
    res.status(500).send('Failed to create a new campground');
  }
}

export const showCampground = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const query = { _id: new mongodb.ObjectId(id) };

  // check if campground is available
  const camp = await collections.campgrounds?.findOne(query)
  if (!camp) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds') // return is important to ensure the rest don't execute
  }

  const aggregationPipeline = [
    {$match: query},
    {$lookup: {
      from: "reviews",
      localField: "reviews",
      foreignField: "_id",
      as: "campgroundReviews"
    }},
    {$lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "authorDetails" 
    }},
    {$unwind: "$authorDetails"}
  ]
  
  const campgroundAsArray = await collections.campgrounds?.aggregate(aggregationPipeline).toArray()
    if (campgroundAsArray) {
    const campground = campgroundAsArray[0];
    res.render('pages/show', { campground });
  } else {
    res.status(404).send(`Failed to find campground id: ${id}`);
  }
}

export const renderEditForm = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const query = { _id: new mongodb.ObjectId(id) , author: new mongodb.ObjectId(req.user!._id)};

  // check if campground is available before updating.
  const campground = await collections.campgrounds?.findOne(query)
  if(campground?.author.toString() !== req.user?._id.toString()) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${id}`);
  
  }
  if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds') // return is important to ensure the rest don't execute
  }
  res.render('pages/edit', { campground });
}

export const updateCampground = async (req:Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const query = { _id: new mongodb.ObjectId(id), author: new mongodb.ObjectId(req.user!._id) };

  // // The line below converts price which is a string to a float first
  // // all data submitted through forms are sent as strings
  const campground: Campground = { ...req.body.campground, price: parseFloat(req.body.campground.price)};
  // Query to delete images
  const pullQuery = {$pull: {images: {public_id: {$in: req.body.deleteImages}}}}

  // 1st Update - delete images if there are any images to delete
  if (req.body.deleteImages) {
    await cloudinary.api.delete_resources(req.body.deleteImages)
    await collections.campgrounds?.updateOne(query, pullQuery)
  }

  // Update image by uploading to cloudinary
  const updateImages = []
  for (const file of req.files as Express.Multer.File[]) {
    const result = await cloudinary.uploader.upload(file.path, {asset_folder: 'YelpCamp'})
    const imageObject = {
      url: result.secure_url,
      public_id: result.public_id
    }
    updateImages.push(imageObject)
  }
  
  const result = await collections.campgrounds?.updateOne(query, {
    $set: campground,
    $push: {images: {$each: updateImages}}
  });

  if (result && result.matchedCount) {
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
  } else {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${id}`);
  }
}

export const deleteCampground = async (req: Request, res: Response, next: NextFunction) => {
  // Best implementation is to use transactions  
    const { id } = req.params;
    const query = { _id: new mongodb.ObjectId(id), author: new mongodb.ObjectId(req.user!._id) };
    
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
  
      if (result?.acknowledged === true) {
        req.flash('success', 'Successfully deleted the campgroud');
        res.redirect('/campgrounds')
      } else {
          console.log("Deletion failed.")
        }
    } else {
      throw new Error("campground not found")
    }
  }