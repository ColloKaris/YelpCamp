import express, { Request, Response, NextFunction} from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';

import { connectToDatabase } from './models/database.js';
import { ExpressError } from './utils/ExpressError.js';
import { campRouter } from './routes/campgrounds.js';
import { reviewsRouter } from './routes/reviews.js';
import { userRouter } from './routes/users.js';

import { User } from './models/user.js';
import { localStrategy } from './strategies/localStrategy.js';

const app = express();
dotenv.config();
const { ATLAS_URI } = process.env;

//check if ATLAS_URI defined, otherwise, exit app
if (!ATLAS_URI) {
  console.log('No ATLAS_URI environment variable has been defined');
  process.exit(1); // uncaught fatal execption(1)
}

// Use import.meta.url to get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs'); // set ejs as templating engine
app.set('views', path.join(__dirname, '/views'));

app.use(expressEjsLayouts); // xpress layouts to make templating easier
app.set('layout', 'layouts/main')

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) // set express to serve static files in the public directory

const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash())

// Middleware for flashing - Put before route handlers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error')
  next();
})

// Passport - Should be AFTER session, and BEFORE the router
app.use(passport.initialize()); // Initialize passport
app.use(passport.session());
passport.use(localStrategy);

app.use('/campgrounds', campRouter)
app.use('/campgrounds/:id/reviews', reviewsRouter)
app.use('/', userRouter)

app.get('/', (req, res) => {
  res.render('pages/home');
});

// 404 page.
app.all('*', (req,res,next) => {
  next(new ExpressError('Page Not Found', 404))
})

// Custom error handling middleware.
app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500} = err;
  if(!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('pages/error', { err });
})

// End of routing logic
connectToDatabase(ATLAS_URI)
  .then(() => {
    //const app = express();
    console.log('Database connected');

    app.listen(3000, () => {
      console.log('SERVER LISTENING ON PORT 3000');
    });
  })
  .catch((error) => console.log(error));