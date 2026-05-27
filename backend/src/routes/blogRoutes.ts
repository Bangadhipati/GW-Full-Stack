// backend/src/routes/blogRoutes.ts

import express from 'express';
import {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getTotalViews,
  trackSiteVisit,
} from '../controllers/blogController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit'; // <--- ADD THIS LINE

const router = express.Router();

// Configure rate limiter for the track-visit endpoint
const visitTrackerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message:
    'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


router.route('/')
  .get(getBlogPosts) // Public access for reading
  .post(protect, authorizeRoles('admin', 'editor'), createBlogPost); // Restricted for creating

router.route('/:id')
  .get(getBlogPostById) // Public access for reading a single post (views incremented here)
  .put(protect, authorizeRoles('admin', 'editor'), updateBlogPost) // Restricted for updating
  .delete(protect, authorizeRoles('admin', 'editor'), deleteBlogPost); // Restricted for deleting

router.get('/stats/total-views', getTotalViews); // Public access for total views
// Apply the rate limiter to the trackSiteVisit route
router.post('/stats/track-visit', visitTrackerLimiter, trackSiteVisit); // <--- MODIFY THIS LINE

export default router;