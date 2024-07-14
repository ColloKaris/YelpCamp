import * as mongodb from 'mongodb';
import { Campground } from './campground.js';

// An object to hold all the collections that will be created in this project
export const collections: {
  campgrounds?: mongodb.Collection<Campground>
} = {};


// CONNECTING TO THE DATABASE
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);  // initialize MongoDB class
  await client.connect(); // connect to MongoDB using the URI

  //create a DB instance and pass in the name of the db
  const db = client.db('yelp-camp')
  // section for validation
  await applySchemaValidation(db); // also create a collection

  const campgroundsCollection = db.collection<Campground>("campgrounds");
  collections.campgrounds = campgroundsCollection;
}

// Validation Schema for the collection
async function applySchemaValidation(db: mongodb.Db) {
  // Define the validator. Store it in constant named jsonSchema
  // jsonSchema(The validator) is a document that is used to specify
  // validation rules.
  const jsonSchema = {
    // The $jsonSchema keyword is used in MongoDB to define a JSON schema for a collection.
    $jsonSchema: {
      bsonType: "object",
      required: ['title', 'price', 'description','location'],
      additionalProperties: false,
      properties: {
        _id: {},
        title: {
          bsonType: 'string',
          description: "'title' is a string and is required"
        },
        price: {
          bsonType: 'string',
          description: "'position is a string and is required'"
        },
        description: {
          bsonType: 'string',
          description: "'description' is a string and is required"
        },
        location: {
          bsonType: 'string',
          description: "'location' is a string and is required"
        }
      }
    }
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db.command({
    collMod: "campgrounds",
    validator: jsonSchema
  }).catch(async (error: mongodb.MongoServerError) => {
    if (error.codeName === "NamespaceNotFound") {
      await db.createCollection("employees", {validator: jsonSchema})
    }
  })
}

