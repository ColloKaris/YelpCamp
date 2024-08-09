import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';

import { collections } from '../models/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userRouter = express.Router();

userRouter.get('/register', (req: Request, res: Response) => {
  res.render('pages/register');
})

userRouter.post('/register', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
  const user = req.body;
  const hash = await bcrypt.hash(req.body.password, 12);
  user.password = hash;

  const result = await collections.users?.insertOne(user);

  if(!result?.acknowledged) throw new Error('Failed to create a new user');
  
  // Log the user in.
  req.login(user, (err) => {
    if (err) return next(err);
    req.flash('success', 'Welcome to Yelp Camp');
    return res.redirect('/campgrounds');
  })} catch (e: any) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}));

userRouter.get('/login', (req: Request, res: Response, next: NextFunction) => {
  res.render('pages/login');
})

userRouter.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), (req: Request, res: Response, next: NextFunction) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/campgrounds')
})

userRouter.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Goodbye');
    res.redirect('/campgrounds')
  });
})