import * as mongodb from 'mongodb';

export interface Review {
  body: string;
  rating: number;
  _id?: mongodb.ObjectId;
  author: string;
}