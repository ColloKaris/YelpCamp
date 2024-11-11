# YelpCamp

This is a Node.js application built using TypeScript. It uses a MongoDB database, EJS for frontend rendering, implements user authorization, and authentication using sessions, and has full CRUD capabilities across all assets in the application. It also uses Cloudinary for media managment of images used in the application. Mapbox is used to create maps and enable forward geocoding.

The goal of this project was to create a Node.js application that works just like YelpCamp.

## How to run the application:

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open your browser and go to: `http://localhost:3000/campgrounds`

## Features:

- User authentication (login/register) with session management.
- Full CRUD across campgrounds, users, and reviews.
- A Model View Controller architecture
- Maps with forward geocoding. Maps implmented using Mapbox.
- Media managment using Cloudinary. You can upload, edit and delete images from cloudinary.
- Authorization for campground modification (only creators can edit/delete their campgrounds).
- Flashing messages

## Tech Stack:

- **Backend**: Node.js, TypeScript, Express 
- **Database**: MongoDB using its official Node.js driver.
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Authentication**: Passport.js with session-based authentication
- **Encryption**: Bcrypt
- **Media Management**: Cloudinary
- **Maps** : Mapbox
