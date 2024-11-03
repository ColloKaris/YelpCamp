import * as mongodb from 'mongodb';
import { Campground } from './campground.js';
import { Review } from './review.js';
import { User } from './user.js';

// An object to hold all the collections that will be created in this project
export const collections: {
  campgrounds?: mongodb.Collection<Campground>,
  reviews?: mongodb.Collection<Review>,
  users?: mongodb.Collection<User>
} = {};

// CONNECTING TO THE DATABASE
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);  // initialize MongoDB class
  await client.connect(); // connect to MongoDB using the URI

  //create a DB instance and pass in the name of the db
  const db = client.db('yelp-camp')
  // section for validation
  await applySchemaValidation(db); // also create a collection

  // used to connect to the specific collections and store references to these
  // collections in the 'collections' object
  const campgroundsCollection = db.collection<Campground>("campgrounds");
  collections.campgrounds = campgroundsCollection;

  const reviewsCollection = db.collection<Review>("reviews");
  collections.reviews = reviewsCollection;

  collections.users = db.collection<User>('users');

  return client; // returns client so that we can use it to close 
  //database connection in other files - I used this client in the seeds/index.ts file
  // to close the db connection after seeding it
}

// Validation Schema for the collection
async function applySchemaValidation(db: mongodb.Db) {
  // Define the validator. Store it in constant named jsonSchema
  // jsonSchema(The validator) is a document that is used to specify
  // validation rules.
  
  const reviewsSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ['body', 'rating', 'author'],
      properties: {
        _id:{},
        body:{
          bsonType: 'string',
          description: 'This is the body of the review and must not be empty'
        },
        author: {
          bsonType: 'string',
          description: 'The username of the owner of the review'
        },
        rating: {
          bsonType: 'number',
          description: 'This is the rating and it should be a number'
        }
      }
    }
  }

  const userSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ['username', 'password', 'email', '_id'],
      properties: {
        _id:{},
        username: {
          bsonType: 'string',
          description: 'A username to identify a user'
        },
        email: {
          bsonType: 'string',
          description: 'An email address for the user'
        },
        password: {
          bsonType: 'string',
          description: 'Hashed version of the user password'
        }
      }
    }
  }
    
  const campgroundSchema = {
    // The $jsonSchema keyword is used in MongoDB to define a JSON schema for a collection.
    $jsonSchema: {
      bsonType: "object",
      required: ['title', 'images','price', 'description','location', 'author','reviews'],
      additionalProperties: false,
      properties: {
        _id: {},
        title: {
          bsonType: 'string',
          description: "'title' is a string and is required"
        },
        images: {
          bsonType: 'array',
          description: 'Image is an array of objects with a url and public_id both as strings',
          items: {
            bsonType: 'object',
            required: ['url', 'public_id'],
            properties: {
              url: {
                bsonType: 'string',
                description: 'Url is a string and is required'
              },
              public_id: {
                bsonType: 'string',
                description: 'Public id is a string and is required'
              }
            }
          }
        },
        price: {
          bsonType: 'number',
          description: "'price' is a number and is required"
        },
        description: {
          bsonType: 'string',
          description: "'description' is a string and is required"
        },
        location: {
          bsonType: 'string',
          description: "'location' is a string and is required"
        },
        author: {
          bsonType: 'objectId',
          description: 'The author of the database'
        },
        reviews: {
          bsonType: 'array',
          items: {bsonType: 'objectId'},
          description: "'This is a visitors review of a campground'"
        }
      }
    }
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db.command({
    collMod: "campgrounds",
    validator: campgroundSchema
  }).catch(async (error: mongodb.MongoServerError) => {
    if (error.codeName === "NamespaceNotFound") {
      await db.createCollection("campgrounds", {validator: campgroundSchema})
    }
  })

  // Try modify the User collection or explicitly create it if it doesn't exist
  await db.command({collMod: 'users', validator: userSchema})
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codename === 'NamespaceNotFound') {
        await db.createCollection('users', {validator: userSchema})
      }
    })

  // Apply the same modification for the reviews collection
  await db.command({
    collMod: "reviews",
    validator: reviewsSchema
  }).catch(async (error: mongodb.MongoServerError) => {
    if (error.codename === "NamespaceNotFound") {
      await db.createCollection("reviews", {validator: reviewsSchema})
    }
  })
}

