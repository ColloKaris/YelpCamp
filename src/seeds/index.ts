// This file will be run separately from our node app
// we'll run it anytime we want to seed the database

import * as mongodb from 'mongodb';
import * as dotenv from 'dotenv';
import { Campground } from '../models/campground.js';
import { connectToDatabase, collections } from '../models/database.js';
import { cities } from './cities.js';
import { descriptors, places } from './seedHelpers.js';
import { deepEqual } from 'assert';

dotenv.config();

const { ATLAS_URI } = process.env;
let client: mongodb.MongoClient;

async function main() {
  try {
    if (!ATLAS_URI) {
      console.log('No ATLAS_URI environment variable has been defined');
      process.exit(1); // uncaught fatal execption(1)
    }
    client = await connectToDatabase(ATLAS_URI)
    console.log('Database Connected');
    await seedDB();
  } catch(error) {
    console.log(error)
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed')
    }
  }
}

const sample = (array: typeof descriptors[] | typeof places) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await collections.campgrounds?.deleteMany({});

  for(let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const campground: Campground = {
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      price: Math.floor(Math.random() * 20) + 10,
      description: `${sample(descriptors)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      reviews: []
    }
    // insert campground in the database
    const result = await collections.campgrounds?.insertOne(campground)
  }
}

main()

// image: `https://picsum.photos/400?random=${Math.random()}`,