import * as mongodb from 'mongodb';

export interface Campground {
  title: String;
  price: String;
  description: String;
  location: String;
  _id?: mongodb.ObjectId;
}

