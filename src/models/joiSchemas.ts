import Joi from 'joi';

// Define the Joi schema for the Campground interface
export const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().min(1).required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        public_id: Joi.string().required()
      })
    ),
    price: Joi.number().positive().required(),
    description: Joi.string().min(1).required(),
    location: Joi.string().min(1).required(),
    author: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    reviews: Joi.array()
      .items(Joi.string().pattern(/^[a-fA-F0-9]{24}$/))
      .default([]),
    geometry: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    })
  }).required(), // this final required is necessary
  // Add required() for the entire object(remember how forms submit under
  // a value campground or reviews)
  // You want the whole thing to be required
  deleteImages: Joi.array()
});

export const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().min(1).required(),
    rating: Joi.number().min(1).max(5).required(),
    author: Joi.string().min(1),
  }).required(),
});
