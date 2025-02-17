import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import loader from './loaders/index';

const PORT: string | number = process.env.PORT || 5000;

const app: Application = express();

app.use(bodyParser.json());

(async () => {
  try {
    // Load custom loader
    await loader({ expressApp: app });
  } catch (err: any) {
    console.error('Initialization failed:', err.message);
    process.exit(1); // Exit if loader or DB connection fails
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
