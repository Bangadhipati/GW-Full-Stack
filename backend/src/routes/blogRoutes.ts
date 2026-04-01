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

const router = express.Router();

router.route('/')
  .get(getBlogPosts) // Public access for reading
  .post(protect, authorizeRoles('admin', 'editor'), createBlogPost); // Restricted for creating

router.route('/:id')
  .get(getBlogPostById) // Public access for reading a single post (views incremented here)
  .put(protect, authorizeRoles('admin', 'editor'), updateBlogPost) // Restricted for updating
  .delete(protect, authorizeRoles('admin', 'editor'), deleteBlogPost); // Restricted for deleting

router.get('/stats/total-views', getTotalViews); // Public access for total views
router.post('/stats/track-visit', trackSiteVisit); // Track a new site visit

export default router;