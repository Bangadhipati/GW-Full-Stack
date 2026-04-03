import mongoose from 'mongoose';

export interface IBlogAuthor {
  name: string;
  bio?: string;
}

export interface IBlogPost extends mongoose.Document {
  title: string;
  slug: string; // Unique SEO-friendly URL identifier
  description?: string; // Made optional
  content: string;
  thumbnail: string;
  date: string; // ISO date string, e.g., "YYYY-MM-DD"
  author: string; // Comma-separated string of authors
  authors?: IBlogAuthor[]; // New structured authors field
  category: string;
  views: number;
}

const BlogAuthorSchema = new mongoose.Schema<IBlogAuthor>({
  name: { type: String, required: true },
  bio: { type: String, required: false },
}, { _id: false });

const BlogPostSchema = new mongoose.Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false }, // Made optional
    content: { type: String, required: true },
    thumbnail: { type: String, required: true }, // URL to image
    date: { type: String, required: true }, // Stored as string, e.g., "2023-10-26"
    author: { type: String, required: true }, // Deprecated, but kept for compatibility
    authors: { type: [BlogAuthorSchema], required: false }, // New structured authors field
    category: { type: String, required: true },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;