import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';
import { connectToDatabase } from './models/database.js';

// Delete this later on
import { Campground } from './models/campground.js';
import { collections } from './models/database.js';
// End

dotenv.config();
const app = express();

// set EJS as templating engine
app.set('view engine', 'ejs');

// Use import.meta.url to get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//set path for it to work from any where
app.set('views', path.join(__dirname, '/views'));

const { ATLAS_URI } = process.env;

//check if ATLAS_URI defined, otherwise, exit app
if (!ATLAS_URI) {
  console.log('No ATLAS_URI environment variable has been defined');
  process.exit(1); // uncaught fatal execption(1)
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/makecampground', async (req, res) => {
  const camp = {title: "My Backyard", price: "300", description: "A test camp", location: "Nairobi"};
  const result = await collections.campgrounds?.insertOne(camp)
  res.send(result);
})

connectToDatabase(ATLAS_URI)
  .then(() => {
    //const app = express();
    console.log('Database connected')


    app.listen(3000, () => {
      console.log('SERVER LISTENING ON PORT 3000');
    });
  })
  .catch((error) => console.log(error));
