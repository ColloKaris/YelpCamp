import * as mongodb from 'mongodb';

export interface Campground {
  title: string;
  images: { url: string, public_id: string; }[];
  price: number;
  description: string;
  location: string;
  author: mongodb.ObjectId,
  reviews: mongodb.ObjectId[],
  _id?: mongodb.ObjectId;
}