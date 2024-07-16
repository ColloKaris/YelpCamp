import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import * as mongodb from 'mongodb';
import methodOverride from 'method-override';
import { connectToDatabase, collections } from './models/database.js';
import { Campground } from './models/campground.js';

const app = express();

dotenv.config();

// Use import.meta.url to get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ATLAS_URI } = process.env;

app.set('view engine', 'ejs'); // set ejs as templating engine
app.set('views', path.join(__dirname, '/views'));

//check if ATLAS_URI defined, otherwise, exit app
if (!ATLAS_URI) {
  console.log('No ATLAS_URI environment variable has been defined');
  process.exit(1); // uncaught fatal execption(1)
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Routing logic - To be moved later

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  try {
    const campgrounds = await collections.campgrounds?.find({}).toArray();
    res.render('campgrounds/index', { campgrounds });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
  try {
    const campground = req.body.campground;
    const result = await collections.campgrounds?.insertOne(campground);
    if (result?.acknowledged) {
      res.status(201).redirect(`/campgrounds/${result.insertedId}`);
    } else {
      res.status(500).send('Failed to create a new campground');
    }
  } catch (error: any) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.get('/campgrounds/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new mongodb.ObjectId(id) };
    const campground = await collections.campgrounds?.findOne(query);

    if (campground) {
      res.render('campgrounds/show', { campground });
    } else {
      res.status(404).send(`Failed to find campground id: ${id}`);
    }
  } catch (error) {
    res.status(404).send('Failed to find campground ID');
  }
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new mongodb.ObjectId(id) };

    const campground = await collections.campgrounds?.findOne(query);
    res.render('campgrounds/edit', { campground });
  } catch (error) {
    res.status(404).send('Failed to edit campground');
  }
});

app.put('/campgrounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new mongodb.ObjectId(id) };
    const campground: Campground = { ...req.body.campground };
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
  } catch (error: any) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

app.delete('/campgrounds/:id', async (req, res) => {
  try {
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
  } catch (error: any) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

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
