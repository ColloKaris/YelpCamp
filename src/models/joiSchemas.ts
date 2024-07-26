import Joi from 'joi';

// Define the Joi schema for the Campground interface
export const campgroundSchema = Joi.object({
  title: Joi.string().min(1).required(),
  image: Joi.string().uri().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().min(1).required(),
  location: Joi.string().min(1).required()
});
