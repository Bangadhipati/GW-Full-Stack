// backend/src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import adRoutes from './routes/adRoutes';
import allianceRoutes from './routes/allianceRoutes';

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://gaudiyawarriors.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// IMPORTANT: Serve static files AFTER API routes if they are distinct,
// or ensure they don't accidentally handle API paths.
// For now, keep it here but understand its placement.
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/alliances', allianceRoutes);

// --- ADD THIS ERROR HANDLING MIDDLEWARE BLOCK ---
// Catch-all for 404 Not Found errors
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Set status before passing to next error handler
  next(error); // Pass to the generic error handler
});

// Generic error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If status code is 200 (meaning no error status was explicitly set yet), default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error(`[ERROR] ${err.message}`); // Log the error on the server
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack); // Log stack in development
  }
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
// --- END ERROR HANDLING MIDDLEWARE BLOCK ---


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => { // Assign app.listen to a variable
  console.log(`Server running on port ${PORT}`);
});

// --- GLOBAL UNHANDLED ERROR HANDLERS ---
// Catch unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  // Log the error and gracefully shut down the server
  server.close(() => {
    process.exit(1); // Exit with failure code
  });
});

// Catch uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error(`[CRITICAL] Uncaught Exception: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  // Log the error and gracefully shut down the server
  server.close(() => {
    process.exit(1); // Exit with failure code
  });
});
// --- END GLOBAL UNHANDLED ERROR HANDLERS ---

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});