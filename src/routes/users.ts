import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { asyncHandler } from '../utils/asyncHandler.js';
import { storeReturnTo } from '../middleware/middleware.js';
import { login, logout, register, renderLogin, renderRegister } from '../controllers/users.js';

export const userRouter = express.Router();

userRouter.route('/register')
  .get(renderRegister)
  .post(asyncHandler(register));

userRouter.route('/login')
  .get(renderLogin)
  .post(storeReturnTo, passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), login);

userRouter.post('/logout', logout);