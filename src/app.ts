import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import router from './routes';
import { config } from 'dotenv';
import { ShutdownCategories } from './types/app.types';

config();

const PORT = 3000;
const app = express();

app.use(helmet());
app.use(cookieParser());

app.use(urlencoded({ extended: false }));
app.use(json());

app.use('/', router);

const server = app.listen(PORT, () => {
  console.log('Server is running on port 3000');
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
