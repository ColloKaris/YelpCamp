# YelpCamp

This is a Node.js application built using TypeScript. It uses a MongoDB database, EJS for frontend rendering, implements user authorization, and authentication using sessions, and has full CRUD capabilities across all assets in the application.

A key objective of the application was to use TypeScript and the official MongoDB Node.js driver, rather than using an ORM such as Mongoose, while implementing a RESTful architecture with authentication and authorization.

The goal was to create a Node.js application that works just like YelpCamp.

## How to run the application:

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open your browser and go to: `http://localhost:3000/campgrounds`

## Features:

- User authentication (login/register) with session management.
- Full CRUD across campgrounds, users, and reviews.
- View details of campgrounds created by other users.
- Authorization for campground modification (only creators can edit/delete their campgrounds).
- Allows uploading images to Cloudinary. The application limits size and nubmer of the images created.

## Tech Stack:

- **Backend**: Node.js, TypeScript, Express
- **Database**: MongoDB
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Authentication**: Passport.js with session-based authentication

## Project Goals:

- Use TypeScript and the official MongoDB Node.js driver.
- Implement RESTful routes.
- Enhance understanding of session-based authentication and user roles.
