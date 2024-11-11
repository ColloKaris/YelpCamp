// This file will be run separately from our node app
// we'll run it anytime we want to seed the database

import * as mongodb from 'mongodb';
import * as dotenv from 'dotenv';
import { Campground } from '../models/campground.js';
import { connectToDatabase, collections } from '../models/database.js';
import { cities } from './cities.js';
import { descriptors, places } from './seedHelpers.js';

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
      price: Math.floor(Math.random() * 20) + 10,
      description: `${sample(descriptors)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      author: new mongodb.ObjectId("66b468a67cfa158b5a23a772"),
      reviews: [],
      images: [
        {
          url: 'https://res.cloudinary.com/dvmtn1i7u/image/upload/v1730693725/qpsawzv4rhuymuhiabpw.png',
          public_id: 'qpsawzv4rhuymuhiabpw'
        },
        {
          url: 'https://res.cloudinary.com/dvmtn1i7u/image/upload/v1730693726/hvuvp2xm6dfck1aertgn.png',
          public_id: 'hvuvp2xm6dfck1aertgn'
        }
    
      ],
      geometry: {
        'type': 'Point',
        'coordinates': [-119.538329, 37.865101]
      }
    }
    // insert campground in the database
    const result = await collections.campgrounds?.insertOne(campground)
  }
}

main()