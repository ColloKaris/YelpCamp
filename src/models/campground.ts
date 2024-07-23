import * as mongodb from 'mongodb';

export interface Campground {
  title: string;
  image: string;
  price: number;
  description: string;
  location: string;
  _id?: mongodb.ObjectId;
}