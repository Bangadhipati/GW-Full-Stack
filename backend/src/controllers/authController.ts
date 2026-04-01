import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User, { IAppUser, UserRole } from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log(`[AUTH] Login attempt for email: ${email}, password: ${password}`);

  const user = await User.findOne({ email });

  if (user) {
    console.log(`[AUTH] User found: ${user.email}`);
    if (user.password && (await user.matchPassword(password))) {
      console.log(`[AUTH] Password matched for user: ${user.email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      console.log(`[AUTH] Password mismatch or no password found for user: ${user.email}`);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } else {
    console.log(`[AUTH] User not found for email: ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get total user count
// @route   GET /api/auth/users/count
// @access  Private
const getUserCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await User.countDocuments();
  res.json({ count });
});

// @desc    Add a new user
// @route   POST /api/auth/users
// @access  Private/Admin
const addUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with that email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user password
// @route   PUT /api/auth/users/:id/password
// @access  Private/Admin
const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  const { newPassword } = req.body;

  if (user) {
    if (req.params.id === req.user?._id.toString()) { // Allow users to change their own password
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else if (req.user?.role === 'admin') { // Admin can change any user's password
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully by admin' });
    } else {
      res.status(403);
      throw new Error('Not authorized to change this user\'s password');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const userToUpdate = await User.findById(req.params.id);
  const { role } = req.body;

  if (userToUpdate) {
    if (userToUpdate.email === 'bangadhipati@gmail.com' && role !== 'admin') {
      res.status(403);
      throw new Error('Cannot change primary admin role');
    }
    userToUpdate.role = role as UserRole;
    const updatedUser = await userToUpdate.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user details (name, email)
// @route   PUT /api/auth/users/:id/details
// @access  Private/Admin
const updateUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userToUpdate = await User.findById(req.params.id);
  const { name, email } = req.body;

  if (userToUpdate) {
    // Check if new email already exists for another user
    if (email && email !== userToUpdate.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.params.id) {
        res.status(400);
        throw new Error('Email already exists for another user');
      }
    }

    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;

    const updatedUser = await userToUpdate.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userToDelete = await User.findById(req.params.id);

  if (userToDelete) {
    if (userToDelete.email === 'bangadhipati@gmail.com') {
      res.status(403);
      throw new Error('Cannot remove the primary admin');
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


export { authUser, getUsers, getUserCount, addUser, updateUserPassword, updateUserRole, updateUserDetails, deleteUser };