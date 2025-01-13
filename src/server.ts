import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './config/database';

const PORT: string | number = process.env.PORT || 5000;

const app: Application = express();

app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  })
);

app.use(bodyParser.json());

(async () => {
  try {

    // Test database connection
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    connection.release();
  } catch (err: any) {
    console.error('Initialization failed:', err.message);
    process.exit(1); // Exit if loader or DB connection fails
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
