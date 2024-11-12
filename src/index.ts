import express, { Request, Response, NextFunction} from 'express';
import { ATLAS_URI, SECRET } from './config/config.js'
import path from 'path';
import { fileURLToPath } from 'url';
import expressEjsLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import passport from 'passport';
import helmet from 'helmet';

import { connectToDatabase } from './models/database.js';
import { ExpressError } from './utils/ExpressError.js';
import { campRouter } from './routes/campgrounds.js';
import { reviewsRouter } from './routes/reviews.js';
import { userRouter } from './routes/users.js';
import { localStrategy } from './strategies/localStrategy.js';

const app = express();

// Use import.meta.url to get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs'); // set ejs as templating engine
app.set('views', path.join(__dirname, '/views'));

app.use(expressEjsLayouts); // xpress layouts to make templating easier
app.set('layout', 'layouts/main')

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) // set express to serve static files in the public directory

const store = MongoStore.create({
  mongoUrl: ATLAS_URI,
  dbName: 'yelp-camp',
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: SECRET as string
  }
});

store.on('error', function(e) {
  console.log('Sessions Store Error', e)
})

const sessionConfig = {
  store: store,
  name: '_zrmhzy',
  secret: SECRET as string,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash())
app.use(helmet())

const scriptSrcUrls: string[] = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
  "https://code.jquery.com",
];

const styleSrcUrls: string[] = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/", // Added for Bootstrap CSS
];

const connectSrcUrls: string[] = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];

const fontSrcUrls: string[] = [
  "https://fonts.gstatic.com", // Typically needed for Google Fonts
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      scriptSrcElem: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      styleSrcElem: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: ["'none'"],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dvmtn1i7u/", // Replace with your Cloudinary account
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Passport - Should be AFTER session, and BEFORE the router
app.use(passport.initialize()); // Initialize passport
app.use(passport.session());
passport.use(localStrategy);

// Middleware for flashing - Put before route handlers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
})

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
connectToDatabase(ATLAS_URI as string)
  .then(() => {
    //const app = express();
    console.log('Database connected');

    app.listen(3000, () => {
      console.log('SERVER LISTENING ON PORT 3000');
    });
  })
  .catch((error) => console.log(error));