import express from 'express';
import dbClient from './utils/db'; // Make sure this path is correct
import startServer from './lib/startServer';
import injectRoutes from './routes';
import injectMiddlewares from './lib/middlewares';

const server = express();

async function initializeServer() {
  try {
    // Connect to the database
    await dbClient.connect();

    if (!dbClient.isAlive()) {
      throw new Error('Database connection failed');
    }

    // Apply middlewares and routes
    injectMiddlewares(server);
    injectRoutes(server);

    // Start the server
    startServer(server);

    console.log('Server started on port 5000');
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1); // Exit the process with an error code
  }
}

initializeServer();
