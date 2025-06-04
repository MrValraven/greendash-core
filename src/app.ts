import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes.js';
import { config } from 'dotenv';
import { ShutdownCategories } from './types/app.types';
import { checkIfEnvironmentVariablesAreSet } from './utils/app.utils.js';
import { checkDbConnection } from './db/index.js';

config();

const PORT = 3000;
const app = express();

/* const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per window
});

app.use('/api/', apiRateLimiter); */

app.use(helmet());
app.use(cookieParser());

app.use(urlencoded({ extended: false, limit: '1mb' }));
app.use(json({ limit: '1mb' }));

app.use('/', router);

const server = app.listen(PORT, () => {
  checkIfEnvironmentVariablesAreSet();
  checkDbConnection();
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown (Ensures smooth process termination)
const gracefulShutdown = (signal: ShutdownCategories) => {
  console.log(`${signal} received. Closing server...`);
  server.close(() => {
    console.log('🛑 HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
