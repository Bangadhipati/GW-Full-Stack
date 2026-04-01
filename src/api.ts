const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const API_STATIC_BASE_URL = API_BASE_URL.replace('/api', ''); // Derived static base URL

interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'ad_manager';
  token: string;
}

interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'ad_manager';
}

interface BlogAuthor {
  name: string;
  bio?: string;
}

interface BlogPost {
  _id: string; // The backend uses _id for MongoDB documents
  id?: string; // Optional: Keep original frontend `id` if still used locally for some reason, though `_id` should replace it.
  title: string;
  description?: string; // Made optional
  content: string;
  thumbnail: string;
  date: string;
  author: string; // Deprecated, use `authors` if possible
  authors?: BlogAuthor[];
  category: string;
  views: number;
}

interface Ad {
  _id: string;
  id?: string; // Optional: Keep original frontend `id` if still used locally for some reason.
  horizontalImageUrl: string;
  verticalImageUrl: string;
  link?: string;
  label?: string;
}

interface Alliance {
  _id: string;
  id?: string; // Optional: Keep original frontend `id` if still used locally for some reason.
  name: string;
  logo: string;
  url: string;
}

const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || response.statusText || 'Something went wrong');
  }
  return data;
};

const api = {
  // --- Auth & Users ---
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getUsers: async (token: string): Promise<AppUser[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  getUserCount: async (token: string): Promise<{ count: number }> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/count`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  addUser: async (userData: { name: string; email: string; password?: string; role: AppUser['role'] }, token: string): Promise<AppUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUserPassword: async (userId: string, newPassword: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/password`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ newPassword }),
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId: string, role: AppUser['role'], token: string): Promise<AppUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  updateUserDetails: async (userId: string, updates: { name?: string; email?: string }, token: string): Promise<AppUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/details`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  // --- Blogs ---
  getBlogs: async (): Promise<BlogPost[]> => {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    const data = await handleResponse(response);
    return data.map((blog: BlogPost) => ({ ...blog, id: blog._id })); // Map _id to id for frontend compatibility
  },

  getBlogPost: async (id: string): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  createBlog: async (blogData: Omit<BlogPost, "_id" | "id" | "views">, token: string): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(blogData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  updateBlog: async (id: string, blogData: Partial<Omit<BlogPost, "_id" | "id">>, token: string): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(blogData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  deleteBlog: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  getTotalBlogViews: async (): Promise<{ totalViews: number; blogViews: number; siteVisits: number }> => {
    const response = await fetch(`${API_BASE_URL}/blogs/stats/total-views`);
    return handleResponse(response);
  },

  trackVisit: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/blogs/stats/track-visit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // --- Ads ---
  getAds: async (): Promise<Ad[]> => {
    const response = await fetch(`${API_BASE_URL}/ads`);
    const data = await handleResponse(response);
    return data.map((ad: Ad) => ({ ...ad, id: ad._id })); // Map _id to id for frontend compatibility
  },

  createAd: async (adData: Omit<Ad, "_id" | "id">, token: string): Promise<Ad> => {
    const response = await fetch(`${API_BASE_URL}/ads`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(adData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  updateAd: async (id: string, adData: Partial<Omit<Ad, "_id" | "id">>, token: string): Promise<Ad> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(adData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  deleteAd: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  // --- Alliances ---
  getAlliances: async (): Promise<Alliance[]> => {
    const response = await fetch(`${API_BASE_URL}/alliances`);
    const data = await handleResponse(response);
    return data.map((alliance: Alliance) => ({ ...alliance, id: alliance._id })); // Map _id to id for frontend compatibility
  },

  createAlliance: async (allianceData: Omit<Alliance, "_id" | "id">, token: string): Promise<Alliance> => {
    const response = await fetch(`${API_BASE_URL}/alliances`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(allianceData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  updateAlliance: async (id: string, allianceData: Partial<Omit<Alliance, "_id" | "id">>, token: string): Promise<Alliance> => {
    const response = await fetch(`${API_BASE_URL}/alliances/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(allianceData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id }; // Map _id to id
  },

  deleteAlliance: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/alliances/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};

export default { ...api, API_STATIC_BASE_URL }; // Export API_STATIC_BASE_URL as well