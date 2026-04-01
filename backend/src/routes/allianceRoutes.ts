import express from 'express';
import {
  getAlliances,
  createAlliance,
  updateAlliance,
  deleteAlliance,
} from '../controllers/allianceController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getAlliances) // Public access
  .post(protect, authorizeRoles('admin'), createAlliance); // Restricted to admin

router.route('/:id')
  .put(protect, authorizeRoles('admin'), updateAlliance) // Restricted to admin
  .delete(protect, authorizeRoles('admin'), deleteAlliance); // Restricted to admin

export default router;