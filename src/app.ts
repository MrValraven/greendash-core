import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import { config } from 'dotenv';

config();

const PORT = 3000;
const app = express();

app.use(cookieParser());

app.use(urlencoded({ extended: false }));
app.use(json());

app.use('/', router);

app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});
