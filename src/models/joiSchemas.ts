import Joi from 'joi';

// Define the Joi schema for the Campground interface
export const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().min(1).required(),
    image: Joi.string().uri().required(),
    price: Joi.number().positive().required(),
    description: Joi.string().min(1).required(),
    location: Joi.string().min(1).required(),
    author: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    reviews: Joi.array()
      .items(Joi.string().pattern(/^[a-fA-F0-9]{24}$/))
      .default([]) ,
  }).required(), // this final required is necessary
  // Add required() for the entire object(remember how forms submit undeer
  // a value campground or reviews)
  // You want the whole thing to be required
});

export const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().min(1).required(),
    rating: Joi.number().min(1).max(5).required(),
    author: Joi.string().min(1),
  }).required(),
});
