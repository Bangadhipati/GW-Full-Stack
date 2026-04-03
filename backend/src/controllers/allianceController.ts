import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Alliance from '../models/Alliance';

// @desc    Get all alliances
// @route   GET /api/alliances
// @access  Public
const getAlliances = asyncHandler(async (req: Request, res: Response) => {
  const alliances = await Alliance.find({});
  res.json(alliances);
});

// @desc    Create a new alliance
// @route   POST /api/alliances
// @access  Private/Admin
const createAlliance = asyncHandler(async (req: Request, res: Response) => {
  const { name, logo, url } = req.body;

  if (!name || !logo) {
    res.status(400);
    throw new Error('Name and logo are required');
  }

  const alliance = new Alliance({
    name,
    logo,
    url,
  });

  const createdAlliance = await alliance.save();
  res.status(201).json(createdAlliance);
});

// @desc    Update an alliance
// @route   PUT /api/alliances/:id
// @access  Private/Admin
const updateAlliance = asyncHandler(async (req: Request, res: Response) => {
  const { name, logo, url } = req.body;

  const alliance = await Alliance.findById(req.params.id);

  if (alliance) {
    alliance.name = name || alliance.name;
    alliance.logo = logo || alliance.logo;
    alliance.url = url || alliance.url;

    const updatedAlliance = await alliance.save();
    res.json(updatedAlliance);
  } else {
    res.status(404);
    throw new Error('Alliance not found');
  }
});

// @desc    Delete an alliance
// @route   DELETE /api/alliances/:id
// @access  Private/Admin
const deleteAlliance = asyncHandler(async (req: Request, res: Response) => {
  const alliance = await Alliance.findById(req.params.id);

  if (alliance) {
    await Alliance.deleteOne({ _id: req.params.id });
    res.json({ message: 'Alliance removed' });
  } else {
    res.status(404);
    throw new Error('Alliance not found');
  }
});

export { getAlliances, createAlliance, updateAlliance, deleteAlliance };