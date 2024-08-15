import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import { collections } from '../models/database.js';

export const renderRegister = (req: Request, res: Response) => {
  res.render('pages/register');
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
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
}

export const renderLogin = (req: Request, res: Response, next: NextFunction) => {
  res.render('pages/login');
}

export const login = (req: Request, res: Response, next: NextFunction) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
}

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Goodbye');
    res.redirect('/campgrounds')
  });
}