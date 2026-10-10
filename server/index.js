import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import {
  errorHandler,
  notFound,
  rateLimit,
  sanitizeInput,
  securityHeaders,
} from './middleware/security.js';
import { logSmtpDiagnostic } from './utils/email.js';

const app = express();

/* ===========================
   REQUEST LOGGER (ADDED)
=========================== */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
/* =========================== */

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);


app.use(securityHeaders);
app.use(rateLimit());
app.use(sanitizeInput);

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);

app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    service: 'cloud-photo-gallery',
  })
);

app.use(notFound);
app.use(errorHandler);

const CONNECTION_URL =
  process.env.MONGODB_URI ||
  process.env.CONNECTION_URL ||
  'mongodb://127.0.0.1:27017/memories';

const PORT = process.env.PORT || 3001;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on http://localhost:${PORT}`);
      logSmtpDiagnostic();
    });
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error);
  });

mongoose.set('useFindAndModify', false);
