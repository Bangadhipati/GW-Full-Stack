import express from 'express';
import {
  getAds,
  createAd,
  updateAd,
  deleteAd,
} from '../controllers/adController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getAds) // Public access
  .post(protect, authorizeRoles('admin', 'ad_manager'), createAd); // Restricted to admin or ad_manager

router.route('/:id')
  .put(protect, authorizeRoles('admin', 'ad_manager'), updateAd) // Restricted to admin or ad_manager
  .delete(protect, authorizeRoles('admin', 'ad_manager'), deleteAd); // Restricted to admin or ad_manager

export default router;