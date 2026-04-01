import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Ad from '../models/Ad';

// @desc    Get all ads
// @route   GET /api/ads
// @access  Public
const getAds = asyncHandler(async (req: Request, res: Response) => {
  const ads = await Ad.find({});
  res.json(ads);
});

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Private/Ad Manager/Admin
const createAd = asyncHandler(async (req: Request, res: Response) => {
  const { horizontalImageUrl, verticalImageUrl, link, label } = req.body;

  if (!horizontalImageUrl || !verticalImageUrl) {
    res.status(400);
    throw new Error('Horizontal and vertical image URLs are required');
  }

  const ad = new Ad({
    horizontalImageUrl,
    verticalImageUrl,
    link: link || undefined,
    label: label || undefined,
  });

  const createdAd = await ad.save();
  res.status(201).json(createdAd);
});

// @desc    Update an ad
// @route   PUT /api/ads/:id
// @access  Private/Ad Manager/Admin
const updateAd = asyncHandler(async (req: Request, res: Response) => {
  const { horizontalImageUrl, verticalImageUrl, link, label } = req.body;

  const ad = await Ad.findById(req.params.id);

  if (ad) {
    ad.horizontalImageUrl = horizontalImageUrl || ad.horizontalImageUrl;
    ad.verticalImageUrl = verticalImageUrl || ad.verticalImageUrl;
    ad.link = link; // Can be empty string to clear link
    ad.label = label; // Can be empty string to clear label

    const updatedAd = await ad.save();
    res.json(updatedAd);
  } else {
    res.status(404);
    throw new Error('Ad not found');
  }
});

// @desc    Delete an ad
// @route   DELETE /api/ads/:id
// @access  Private/Ad Manager/Admin
const deleteAd = asyncHandler(async (req: Request, res: Response) => {
  const ad = await Ad.findById(req.params.id);

  if (ad) {
    await Ad.deleteOne({ _id: req.params.id });
    res.json({ message: 'Ad removed' });
  } else {
    res.status(404);
    throw new Error('Ad not found');
  }
});

// For rotation interval, this is typically managed client-side or as a simple config.
// A simple config could be stored in the database or an in-memory variable on the server.
// For this example, we'll assume the frontend manages the rotation interval state
// and just requests ads. If a backend config is truly needed, we would need a new model/endpoint.
// Let's add a placeholder for a 'settings' concept for rotation interval in the future.

export { getAds, createAd, updateAd, deleteAd };