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

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
const corsOptions = {
  origin: [frontendUrl],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

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
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Generic error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If status code is 200 (meaning no error status was explicitly set yet), default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
// --- END ERROR HANDLING MIDDLEWARE BLOCK ---


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});