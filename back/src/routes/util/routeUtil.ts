import fs from "fs";
import path from "path";
import express from "express";
import logger from "../../utils/logger";

// Dynamically imports and registers all routes from the routes directory.
// Add any new routes to the routes directory and they will be automatically registered.

export async function importAndRegisterRoutes(app: express.Application) {
  const routesDir = path.join(__dirname, "..");

  const files = fs
    .readdirSync(routesDir, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .map((item) => path.join(routesDir, item.name));

  for (const file of files) {
    // Remove the file extension for dynamic import
    const fileWithoutExtension = file.replace(/\.[tj]s$/, "");
    const routeModule = await import(fileWithoutExtension);

    // Check if the module exports a default object with path and router
    if (
      routeModule.default &&
      routeModule.default.path &&
      routeModule.default.router
    ) {
      logger.info(`Registering route: ${routeModule.default.path}`);
      app.use(routeModule.default.path, routeModule.default.router); // Register the route
    } else {
      logger.warn(`Invalid route module: ${fileWithoutExtension}`);
    }
  }
}
