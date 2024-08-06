import express from 'express';
import routes from './routes/index.js';
import dbClient from './utils/db.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(routes);

(async () => {
    await dbClient.connect();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
