# YelpCamp

This is a Node.js application built using TypeScript. It uses a MongoDB database, EJS for frontend rendering, implements user authorization, and authentication using sessions, and has full CRUD capabilities across all assets in the application. It also uses Cloudinary for media managment of images used in the application. Mapbox is used to create maps, enable forward geocoding, display maps and facilite clustering campgrounds according to location.

The goal of this project was to create a Node.js application that works just like YelpCamp.

## How to run the application:

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open your browser and go to: `http://localhost:3000/`

## Features:

- User authentication (login/register) with session management.
- Full CRUD across campgrounds, users, and reviews.
- A Model View Controller architecture
- Maps with forward geocoding and clustering.
- Media managment using Cloudinary.
- Authorization for campground modification (only creators can edit/delete their campgrounds).
- Flashing messages
- Once you login, you have access to full CRUD on campgrounds, images and reviews.
- HTML sanitization to avoid malicious HTML being passed as input to any field
- Client-side and server-side validations of user input
- A campground you add shows up on the up. When a user is logged in, they can leave reviews to the various campgrounds.

## Tech Stack:

- **Backend**: Node.js, TypeScript, Express 
- **Database**: MongoDB using its official Node.js driver. MongoDB Atlas used in deployment
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Authentication**: Passport.js with session-based authentication
- **Encryption**: Bcrypt
- **Session store**: MongoDB
- **Media Management**: Cloudinary
- **Maps** : Mapbox
- **Security**: Helmet, sanitize-html, JOI
- **Deployment**: Render
