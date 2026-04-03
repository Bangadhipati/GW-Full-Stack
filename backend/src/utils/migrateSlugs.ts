import dotenv from 'dotenv';
import connectDB from '../config/db';
import BlogPost from '../models/BlogPost';

dotenv.config();

const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${randomSuffix}`;
};

const migrate = async () => {
  try {
    await connectDB();
    
    const blogs = await BlogPost.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: "" },
        { slug: null }
      ] 
    });

    console.log(`Found ${blogs.length} posts needing slugs.`);

    for (const blog of blogs) {
      blog.slug = generateSlug(blog.title);
      await blog.save();
      console.log(`Updated: ${blog.title} -> ${blog.slug}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();