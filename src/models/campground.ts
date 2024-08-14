import * as mongodb from 'mongodb';

export interface Campground {
  title: string;
  image: string;
  price: number;
  description: string;
  location: string;
  author: mongodb.ObjectId,
  reviews: mongodb.ObjectId[],
  _id?: mongodb.ObjectId;
}