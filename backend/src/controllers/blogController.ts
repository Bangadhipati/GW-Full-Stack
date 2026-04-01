import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import BlogPost, { IBlogAuthor } from '../models/BlogPost';
import mongoose from 'mongoose';

// Simple inline schema for global stats tracking
const StatsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});
const Stats = mongoose.models.Stats || mongoose.model('Stats', StatsSchema);

// Helper to parse authors from string to array of objects
const parseAuthorsFromString = (authorString: string): IBlogAuthor[] => {
  if (!authorString) return [];
  const parts = authorString.split(/,\s*|\s+and\s+/).filter(Boolean);
  return parts.map(name => ({ name: name.trim() }));
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogPost.find({}).sort({ date: -1, createdAt: -1 });
  res.json(blogs);
});

// @desc    Get a single blog post by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogPostById = asyncHandler(async (req: Request, res: Response) => {
  // Use atomic $inc for real-time tracking accuracy
  const blog = await BlogPost.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (blog) {
    res.json(blog);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private/Editor/Admin
const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, content, thumbnail, date, author, authors, category } = req.body;

  // Description is now optional
  if (!title || !content || !thumbnail || !date || !category) {
    res.status(400);
    throw new Error('Please fill all required fields: Title, Content, Thumbnail, Date, Category');
  }

  // Use structured authors if provided, otherwise parse from string
  const blogAuthors = authors && authors.length > 0 ? authors : parseAuthorsFromString(author);

  const blogPost = new BlogPost({
    title,
    description,
    content,
    thumbnail,
    date,
    author, // Keep for backward compatibility/simpler display
    authors: blogAuthors,
    category,
    views: 0, // Initial views
  });

  const createdBlogPost = await blogPost.save();
  res.status(201).json(createdBlogPost);
});

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private/Editor/Admin
const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, content, thumbnail, date, author, authors, category } = req.body;

  const blog = await BlogPost.findById(req.params.id);

  if (blog) {
    // Use structured authors if provided, otherwise parse from string
    const blogAuthors = authors && authors.length > 0 ? authors : parseAuthorsFromString(author);

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.content = content || blog.content;
    blog.thumbnail = thumbnail || blog.thumbnail;
    blog.date = date || blog.date;
    blog.author = author || blog.author;
    blog.authors = blogAuthors;
    blog.category = category || blog.category;

    const updatedBlogPost = await blog.save();
    res.json(updatedBlogPost);
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Editor/Admin
const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogPost.findById(req.params.id);

  if (blog) {
    await BlogPost.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog post removed' });
  } else {
    res.status(404);
    throw new Error('Blog post not found');
  }
});

// @desc    Get total views (sum of all content views + global site visits)
// @route   GET /api/blogs/stats/total-views
// @access  Public
const getTotalViews = asyncHandler(async (req: Request, res: Response) => {
  // Get sum of all blog post views
  const blogViewsResult = await BlogPost.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" }
      }
    }
  ]);
  
  // Also get global site visits from Stats collection
  let siteVisits = await Stats.findOne({ name: 'site_visits' });
  if (!siteVisits) {
    siteVisits = await Stats.create({ name: 'site_visits', value: 0 });
  }

  const blogViews = blogViewsResult.length > 0 ? blogViewsResult[0].totalViews : 0;
  const totalViews = blogViews + siteVisits.value;

  res.json({ 
    totalViews,
    blogViews,
    siteVisits: siteVisits.value
  });
});

// @desc    Increment global site visit counter
// @route   POST /api/blogs/stats/track-visit
// @access  Public
const trackSiteVisit = asyncHandler(async (req: Request, res: Response) => {
  await Stats.findOneAndUpdate(
    { name: 'site_visits' },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );
  res.status(200).json({ message: 'Visit tracked' });
});


export { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost, getTotalViews, trackSiteVisit };