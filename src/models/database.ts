import * as mongodb from 'mongodb';
import { Campground } from './campground.js';

// An object to hold all the collections that will be created in this project
export const collections: {
  campground?: mongodb.Collection<Campground>
} = {};


// CONNECTING TO THE DATABASE
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);  // initialize MongoDB class
  await client.connect(); // connect to MongoDB using the URI

  //create a DB instance and pass in the name of the db
  const db = client.db('yelp-camp')
}

