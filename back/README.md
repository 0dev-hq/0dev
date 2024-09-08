# Project Folder Structure

This document describes the folder structure used in this project.

## /src
- Contains the main application code.

### /config
- Configuration files for Passport.js, database connections, and other environment-specific setups.

### /controllers
- Handles business logic and processes incoming requests. Controllers receive requests from the routes and interact with services and models.

### /middlewares
- Custom Express.js middleware functions, such as authentication, logging, and request validation.

### /models
- Mongoose models for MongoDB, defining the schema of the collections in the database.

### /routes
- Express routes that map HTTP requests to controller methods.

### /services
- Contains business logic and reusable services like authentication, database interaction, and more. These are independent of controllers.

### /types
- Contains TypeScript type definitions and interfaces for the project.

### /utils
- Utility functions that can be used throughout the application (e.g., token generation, hash utilities).

## /dist
- This folder contains the compiled JavaScript files once the TypeScript code is transpiled.

## /public
- Public folder for static assets like CSS, images, or client-side JavaScript files.

## /views
- Template files for rendering HTML pages (if using server-side rendering).

## Root Files
- **.env**: Environment variables for the application.
- **.gitignore**: Specifies which files and directories should be ignored by Git.
- **tsconfig.json**: TypeScript configuration.
- **package.json**: Contains project metadata and dependencies.
