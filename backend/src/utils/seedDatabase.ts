// backend/src/utils/seedDatabase.ts
import dotenv from 'dotenv';
import connectDB from '../config/db';
import User from '../models/User';
import BlogPost from '../models/BlogPost';
import Ad from '../models/Ad';
import Alliance from '../models/Alliance';

import { DEFAULT_ADS, ISeedAd } from '../data/ads';
import { blogPosts as DEFAULT_BLOGS, ISeedBlogPost } from '../data/blogs';
import { DEFAULT_ALLIANCES, ISeedAlliance } from '../data/alliances';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany({});
    await BlogPost.deleteMany({});
    await Ad.deleteMany({});
    await Alliance.deleteMany({});

    console.log('Existing data cleared!');

    // --- Users ---
    const usersData = [
      { email: "bangadhipati@gmail.com", password: "1234", name: "Bangadhipati", role: "admin" },
      { email: "vangadhipati@gmail.com", password: "1234", name: "Vangadhipati", role: "editor" },
      { email: "debarghya.bhowmick@yahoo.com", password: "1234", name: "Debarghya Bhowmick", role: "ad_manager" },
    ];

    const createdUsers = [];
    // IMPORTANT: Iterate and save each user individually to trigger the pre('save') hashing hook
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users seeded!`);

    // --- Blog Posts ---
    const blogsToSeed = DEFAULT_BLOGS.map((blog: ISeedBlogPost) => ({
      ...blog,
      author: blog.author || (blog.authors ? blog.authors.map((a: { name: string }) => a.name).join(', ') : 'Unknown Author'),
      authors: blog.authors || (blog.author ? blog.author.split(/,\s*|\s+and\s+/).filter(Boolean).map((name: string) => ({ name: name.trim() })) : []),
      views: Math.floor(Math.random() * 500) + 100,
    }));
    const createdBlogs = await BlogPost.insertMany(blogsToSeed);
    console.log(`${createdBlogs.length} blog posts seeded!`);

    // --- Ads ---
    const adsToSeed = DEFAULT_ADS.map((ad: ISeedAd) => ({
      ...ad,
    }));
    const createdAds = await Ad.insertMany(adsToSeed);
    console.log(`${createdAds.length} ads seeded!`);

    // --- Alliances ---
    const alliancesToSeed = DEFAULT_ALLIANCES.map((alliance: ISeedAlliance) => ({
      ...alliance,
    }));
    const createdAlliances = await Alliance.insertMany(alliancesToSeed);
    console.log(`${createdAlliances.length} alliances seeded!`);


    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
};

seedData();