import * as mongodb from 'mongodb';

export interface Campground {
  title: String;
  image: String;
  price: Number;
  description: String;
  location: String;
  _id?: mongodb.ObjectId;
}