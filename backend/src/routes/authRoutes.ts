import express from 'express';
import {
  authUser,
  getUsers,
  getUserCount,
  addUser,
  updateUserPassword,
  updateUserRole,
  updateUserDetails,
  deleteUser,
} from '../controllers/authController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', authUser);

// Protected routes
router.get('/users/count', protect, getUserCount);

router.route('/users')
  .get(protect, authorizeRoles('admin'), getUsers)
  .post(protect, authorizeRoles('admin'), addUser);

router.route('/users/:id')
  .put(protect, authorizeRoles('admin'), updateUserDetails) // Update name/email
  .delete(protect, authorizeRoles('admin'), deleteUser);

router.put('/users/:id/password', protect, authorizeRoles('admin'), updateUserPassword);
router.put('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);

export default router;