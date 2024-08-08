import express, { Request, Response, NextFunction } from 'express';
import { ExpressError } from '../utils/ExpressError.js';
import { campgroundSchema } from '../models/joiSchemas.js';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if(!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next()
}

// Validation middlewares - Campground validation using Joi
export const validateCampground = (req: Request, res: Response, next: NextFunction) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    throw new ExpressError(error.message, 400)
  } else {
    next();
  }
}

