import express, { Request, Response, NextFunction} from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import * as mongodb from 'mongodb';
import { campgroundSchema } from './models/joiSchemas.js';
import expressEjsLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import { connectToDatabase, collections } from './models/database.js';
import { Campground } from './models/campground.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { ExpressError } from './utils/ExpressError.js';

const app = express();

dotenv.config();

// Use import.meta.url to get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ATLAS_URI } = process.env;

app.set('view engine', 'ejs'); // set ejs as templating engine
app.set('views', path.join(__dirname, '/views'));
app.use(expressEjsLayouts); // xpress layouts to make templating easier
app.set('layout', 'layouts/main')

//check if ATLAS_URI defined, otherwise, exit app
if (!ATLAS_URI) {
  console.log('No ATLAS_URI environment variable has been defined');
  process.exit(1); // uncaught fatal execption(1)
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Validation middleware. Uses Joi.
const validateCampground = (req: Request, res: Response, next: NextFunction) => {
  const { error } = campgroundSchema.validate(req.body.campground)
  if (error) {
    throw new ExpressError(error.message, 400)
  } else {
    next();
  }
}

// Routing logic - To be moved later
app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/campgrounds', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const campgrounds = await collections.campgrounds?.find({}).toArray();
    res.render('pages/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
  res.render('pages/new');
});

app.post('/campgrounds',validateCampground, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const campground = req.body.campground;
  campground.price = parseFloat(campground.price);
  const result = await collections.campgrounds?.insertOne(campground);
  if (result?.acknowledged) {
    res.status(201).redirect(`/campgrounds/${result.insertedId}`);
  } else {
    res.status(500).send('Failed to create a new campground');
  }
}));

app.get('/campgrounds/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const query = { _id: new mongodb.ObjectId(id) };
    const campground = await collections.campgrounds?.findOne(query);

    if (campground) {
      res.render('pages/show', { campground });
    } else {
      res.status(404).send(`Failed to find campground id: ${id}`);
    }
}));

app.get('/campgrounds/:id/edit', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const query = { _id: new mongodb.ObjectId(id) };

    const campground = await collections.campgrounds?.findOne(query);
    res.render('pages/edit', { campground });
}));

app.put('/campgrounds/:id',validateCampground, asyncHandler(async (req:Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const query = { _id: new mongodb.ObjectId(id) };
    // The line below converts price which is a string to a float first
    // all data submitted through forms are sent as strings
    const campground: Campground = { ...req.body.campground, price: parseFloat(req.body.campground.price)};
    const result = await collections.campgrounds?.updateOne(query, {
      $set: campground,
    });

    if (result && result.matchedCount) {
      console.log(`Updated a Campground: ID ${id}.`);
      res.redirect(`/campgrounds/${id}`);
    } else if (result!.matchedCount) {
      res.status(404).send(`Failed to find a Campground: ID ${id}`);
    } else {
      res.status(304).send(`Failed to update Campground: ID ${id}`);
    }
}));

app.delete('/campgrounds/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const query = { _id: new mongodb.ObjectId(id) };
    const result = await collections.campgrounds?.deleteOne(query);

    if (result && result.deletedCount) {
      console.log(`Removed Campground : ID ${id}`);
      res.redirect('/campgrounds')
  } else if (!result) {
      res.status(400).send(`Failed to remove a Campground: ID ${id}`);
  } else if (!result.deletedCount) {
      res.status(404).send(`Failed to find a Campground: ID ${id}`);
  }
}));

app.post('/campgrounds/:id/reviews', asyncHandler((async (req, res) => {
  const campgroundId = req.params.id;
  const review = req.body.review;
  review.rating = parseFloat(review.rating)

  // create review
  const result = await collections.reviews?.insertOne(review)
  const reviewId = result?.insertedId;

  // Update the campground to push the new reviewId into the reviews array
  const reviewedCamp = await collections.campgrounds?.updateOne(
    {_id:new mongodb.ObjectId(campgroundId)}, { $push: {reviews: reviewId}});

  if (reviewedCamp?.modifiedCount === 1) {
    console.log("Updated the campround with a review");
    res.redirect(`/campgrounds/${campgroundId}`)
  } else if(reviewedCamp?.matchedCount === 0) {
    res.status(400).send(`Failed to find a Campground: ID ${campgroundId}`);
  }
})))

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
