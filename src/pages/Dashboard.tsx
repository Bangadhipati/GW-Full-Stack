import { useState, useEffect, useRef, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Users, FileText, X, Save,
  Megaphone, Image, Link as LinkIcon, Clock, Shield, PenLine, BarChart3,
  KeyRound, UserPlus, ChevronDown, Upload, Handshake, Loader2,
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Minus, SquareCode
} from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { uploadImage } from "@/lib/cloudinary";
import { compressImage } from "@/lib/imageProcessor"; // Import the new image processor
import { useAds } from "@/contexts/AdContext";
import { useAlliances, Alliance } from "@/contexts/AllianceContext";
import { useBlogs } from "@/contexts/BlogContext";
import { Ad } from "@/data/ads";
import { BlogPost, BlogAuthor } from "@/data/blogs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import api from "@/api";

// ImageUploadField to purely handle URL input
interface ImageUploadFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (url: string) => void;
  inputClass: string;
  labelClass: string;
  placeholder?: string;
  previewClass?: string;
  // Optional image processing options
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  imageQuality?: number;
}

const ImageUploadField = ({
  label,
  required,
  value,
  onValueChange,
  inputClass,
  labelClass,
  placeholder,
  previewClass,
  imageMaxWidth,
  imageMaxHeight,
  imageQuality,
}: ImageUploadFieldProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    setUploadProgress(0); // Reset progress

    try {
      setIsProcessing(true);
      // Compress and resize the image client-side before uploading
      const compressedFile = await compressImage(file, imageMaxWidth, imageMaxHeight, imageQuality);
      setIsProcessing(false);

      setIsUploading(true);
      const url = await uploadImage(compressedFile, (progress) => {
        setUploadProgress(progress);
      });
      onValueChange(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isLoading = isProcessing || isUploading;

  return (
    <div className="space-y-1.5">
      <label className={labelClass}>
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder || "https://example.com/image.jpg"}
            className={`${inputClass} flex-1`}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="h-10 shrink-0 bg-secondary/80 hover:bg-secondary border border-border"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-[10px] text-destructive font-body">{error}</p>}
        {isProcessing && <p className="text-[10px] text-muted-foreground font-body">Processing image for upload...</p>}
        {isUploading && (
          <div className="text-[10px] text-muted-foreground font-body flex items-center gap-2">
            <span>Uploading: {uploadProgress}%</span>
            <div className="h-1 w-full bg-border rounded-full">
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>
      {value && (
        <div className={`mt-2 overflow-hidden rounded-lg border border-border ${previewClass || "aspect-video max-h-40"}`}>
          <img src={`${value.startsWith('http') ? '' : api.API_STATIC_BASE_URL}${value}`} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
};

const CategoryDropdown = ({ value, blogs, onChange, inputClass }: { value: string; blogs: BlogPost[]; onChange: (v: string) => void; inputClass: string }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState("");
  const existing = useMemo(() => Array.from(new Set(blogs.map((b) => b.category).filter(Boolean))).sort(), [blogs]);

  if (showCustom) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Enter new category"
          className={`${inputClass} flex-1`}
          autoFocus
        />
        <button
          type="button"
          onClick={() => { if (custom.trim()) { onChange(custom.trim()); setShowCustom(false); setCustom(""); } }}
          className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-heading text-primary hover:bg-primary/10 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => { setShowCustom(false); setCustom(""); }}
          className="rounded-lg border border-border bg-secondary/50 px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <select
      value={existing.includes(value) ? value : value ? "__custom__" : ""}
      onChange={(e) => {
        if (e.target.value === "__new__") { setShowCustom(true); }
        else onChange(e.target.value);
      }}
      className={inputClass}
    >
      <option value="">Select category…</option>
      {existing.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
      {value && !existing.includes(value) && (
        <option value="__custom__" disabled>{value}</option>
      )}
      <option value="__new__">+ New Category</option>
    </select>
  );
};

const ROLE_LABELS: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "text-primary" },
  editor: { label: "Editor", icon: PenLine, color: "text-green-400" },
  ad_manager: { label: "Ad Manager", icon: Megaphone, color: "text-yellow-400" },
};

const Dashboard = () => {
  const { user, isAdmin, hasRole, accounts, userCount, fetchAccounts, updatePassword, addAccount, removeAccount, updateAccountRole, updateAccountDetails } = useAuth();
  const { ads, rotationInterval, addAd, removeAd, updateAd, setRotationInterval, fetchAds } = useAds();
  const { alliances, addAlliance, updateAlliance, removeAlliance, fetchAlliances } = useAlliances();
  const { blogs, addBlog, updateBlog, removeBlog, totalViews, fetchBlogs, fetchTotalViews } = useBlogs();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch initial data on mount (contexts handle their own initial fetch, but this ensures they are populated)
  useEffect(() => {
    fetchBlogs();
    fetchAds();
    fetchAlliances();
    fetchTotalViews();
    fetchAccounts();
  }, [fetchBlogs, fetchAds, fetchAlliances, fetchTotalViews, fetchAccounts]);


  type TabId = "blogs" | "users" | "ads" | "alliances";
  const canAccessBlogs = isAdmin || hasRole("editor");
  const canAccessAds = isAdmin || hasRole("ad_manager");
  const canAccessUsers = isAdmin; // Only admin can see the full team list
  const canAccessAlliances = isAdmin;

  const defaultTab: TabId = canAccessBlogs ? "blogs" : canAccessAds ? "ads" : "alliances"; // Adjusted default tab order
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [showAdEditor, setShowAdEditor] = useState(false);
  const [isSavingAd, setIsSavingAd] = useState(false);
  // Adjusted Ad type to use _id for backend interaction, and id for frontend compatibility
  const [editingAd, setEditingAd] = useState<Partial<Ad> & { isNew?: boolean }>({});


  // Alliance management state
  const [showAllianceEditor, setShowAllianceEditor] = useState(false);
  const [isSavingAlliance, setIsSavingAlliance] = useState(false);
  // Adjusted Alliance type to use _id for backend interaction, and id for frontend compatibility
  const [editingAlliance, setEditingAlliance] = useState<Partial<Alliance> & { isNew?: boolean }>({});

  // User management state
  const [showAddUser, setShowAddUser] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "", role: "editor" as UserRole });
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [userError, setUserError] = useState("");

  if (!user) return <Navigate to="/" replace />;

  // Blog handlers
  const handleDelete = async (id: string) => {
    const errorMsg = await removeBlog(id);
    if (errorMsg) setUserError(errorMsg); // Use a general error state or specific for blogs
  };
  const handleSave = async () => {
    if (!editingBlog) return;
    setUserError(""); // Clear previous error
    setIsSavingBlog(true);

    try {
      // Ensure authors array is filtered to only include valid names
      const validAuthors = editingBlog.authors?.filter(a => a.name.trim()) || [];
      // Reconstruct the comma-separated author string from the structured authors
      const authorString = validAuthors.map(a => a.name.trim()).join(", ");

      const blogDataToSend: Omit<BlogPost, "_id" | "id" | "views"> = {
          title: editingBlog.title,
          description: editingBlog.description,
          content: editingBlog.content,
          thumbnail: editingBlog.thumbnail,
          date: editingBlog.date,
          author: authorString, // Ensure this reflects the structured authors
          authors: validAuthors, // Send the structured authors
          category: editingBlog.category,
      };

      let errorMsg: string | null = null;
      if (editingBlog._id) { // Check for _id from backend
        errorMsg = await updateBlog(editingBlog._id, blogDataToSend);
      } else {
        // For new blogs, _id is not required, and views will be defaulted by backend
        // Basic validation for new posts:
        if (!blogDataToSend.title || !blogDataToSend.content || !blogDataToSend.thumbnail || !blogDataToSend.date || !blogDataToSend.category || !blogDataToSend.author) {
            setUserError("Please fill all required fields: Title, Content, Thumbnail, Date, Author, Category.");
            setIsSavingBlog(false);
            return;
        }
        errorMsg = await addBlog(blogDataToSend);
      }

      if (errorMsg) {
        setUserError(errorMsg);
      } else {
        setShowEditor(false);
        setEditingBlog(null);
      }
    } catch (err: any) {
      setUserError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSavingBlog(false);
    }
  };

  // Helper to consistently get authors for the editor, from either authors array or author string
  const getAuthorsForEditor = (blogPost: Partial<BlogPost> | null): BlogAuthor[] => {
    if (!blogPost) return [];
    if (blogPost.authors && blogPost.authors.length > 0) {
      return blogPost.authors;
    }
    if (blogPost.author) {
      const parts = blogPost.author.split(/,\s*|\s+and\s+/).filter(Boolean);
      return parts.map((name) => ({ name: name.trim(), bio: "" }));
    }
    return [];
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!editingBlog) return;
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Capture current scroll position
    const currentContent = editingBlog.content;
    const selectedText = currentContent.substring(start, end);

    const newContent = 
      currentContent.substring(0, start) + 
      prefix + selectedText + suffix + 
      currentContent.substring(end);

    setEditingBlog({ ...editingBlog, content: newContent });

    // Move cursor back to useful position and preserve scroll
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        // If text was selected, put cursor after suffix. If not, put it between prefix and suffix.
        const newCursorPos = selectedText 
          ? start + prefix.length + selectedText.length + suffix.length
          : start + prefix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.scrollTop = scrollTop; // Restore scroll position
      }
    }, 0);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBlog) return;
    
    try {
      setIsUploadingContentImage(true);
      // Compress and resize the image client-side before uploading
      const compressedFile = await compressImage(file, 1600, 1600, 0.8);
      const url = await uploadImage(compressedFile);
      
      const textarea = contentTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = editingBlog.content;
        const scrollTop = textarea.scrollTop;
        
        // Markdown image syntax
        const markdown = `\n![${file.name.split('.')[0]}](${url})\n`;
        const newContent = currentContent.substring(0, start) + markdown + currentContent.substring(end);
        
        setEditingBlog({ ...editingBlog, content: newContent });
        
        // Return focus to textarea and place cursor after the inserted image
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            const newPos = start + markdown.length;
            textarea.setSelectionRange(newPos, newPos);
            textarea.scrollTop = scrollTop;
          }
        }, 0);
      } else {
        setEditingBlog({ ...editingBlog, content: editingBlog.content + `\n![Image](${url})\n` });
      }
    } catch (err: any) {
      console.error("Content image upload error:", err);
      setUserError(err.message || "Failed to upload image to content");
    } finally {
      setIsUploadingContentImage(false);
      if (contentImageInputRef.current) contentImageInputRef.current.value = "";
    }
  };

  const handleNew = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setEditingBlog({
      _id: "", // Empty _id signifies a new post
      title: "", description: "", content: "", thumbnail: "",
      date: formattedDate, // Set to local current date
      author: "", // Keep blank as per user request
      authors: [{ name: "", bio: "" }], // Start with one empty author field
      category: "", views: 0
    });
    setShowEditor(true);
    setUserError("");
  };

  // Ad handlers
  const handleNewAd = () => {
    setEditingAd({ isNew: true, horizontalImageUrl: "", verticalImageUrl: "", link: "", label: "" });
    setShowAdEditor(true);
    setUserError("");
  };
  const handleEditAd = (ad: Ad) => {
    setEditingAd({ ...ad, isNew: false });
    setShowAdEditor(true);
    setUserError("");
  };
  const handleSaveAd = async () => {
    if (!editingAd.horizontalImageUrl || !editingAd.verticalImageUrl) {
      setUserError("Both horizontal and vertical image URLs are required.");
      return;
    }
    setUserError("");
    setIsSavingAd(true);
    
    try {
      const payload = {
        horizontalImageUrl: editingAd.horizontalImageUrl,
        verticalImageUrl: editingAd.verticalImageUrl,
        link: editingAd.link || "",
        label: editingAd.label || "",
      };

      let errorMsg: string | null = null;
      if (editingAd.isNew) {
        errorMsg = await addAd(payload);
      } else if (editingAd._id) { // Use _id for update
        errorMsg = await updateAd(editingAd._id, payload);
      }

      if (errorMsg) {
        setUserError(errorMsg);
      } else {
        setShowAdEditor(false);
        setEditingAd({});
      }
    } catch (err: any) {
      setUserError(err.message || "An error occurred while saving the ad.");
    } finally {
      setIsSavingAd(false);
    }
  };

  // User handlers
  const handleAddUser = async () => {
    setUserError("");
    if (!newUser.email || !newUser.name || !newUser.password) {
      setUserError("All fields are required.");
      return;
    }
    const err = await addAccount(newUser);
    if (err) { setUserError(err); return; }
    setShowAddUser(false);
    setNewUser({ email: "", name: "", password: "", role: "editor" });
  };
  const handlePasswordChange = async (userId: string) => {
    setUserError("");
    if (!newPassword || newPassword.length < 4) {
      setUserError("Password must be at least 4 characters.");
      return;
    }
    const err = await updatePassword("", userId, newPassword); // email is not needed by backend func
    if (err) { setUserError(err); return; }
    setEditingPassword(null);
    setNewPassword("");
  };
  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUserError("");
    const err = await updateAccountRole(userId, role);
    if (err) setUserError(err);
    else setEditingRole(null);
  };
  const handleAccountRemove = async (userId: string) => {
    setUserError("");
    const err = await removeAccount(userId);
    if (err) setUserError(err);
  };
  const handleAccountDetailsUpdate = async (userId: string) => {
    setUserError("");
    if (!editName.trim() || !editEmail.trim()) {
      setUserError("Name and Email cannot be empty.");
      return;
    }
    const err = await updateAccountDetails(userId, { name: editName, email: editEmail });
    if (err) setUserError(err);
    else setEditingDetails(null);
  };


  // Alliance Handlers
  const handleSaveAlliance = async () => {
    if (!editingAlliance.name || !editingAlliance.logo) {
      setUserError("Name and logo are required for an alliance.");
      return;
    }
    setUserError("");
    setIsSavingAlliance(true);

    try {
      const payload = {
        name: editingAlliance.name,
        logo: editingAlliance.logo,
        url: editingAlliance.url || "#",
      };

      let errorMsg: string | null = null;
      if (editingAlliance.isNew) {
        errorMsg = await addAlliance(payload);
      } else if (editingAlliance._id) { // Use _id for update
        errorMsg = await updateAlliance(editingAlliance._id, payload);
      }

      if (errorMsg) {
        setUserError(errorMsg);
      } else {
        setShowAllianceEditor(false);
        setEditingAlliance({});
      }
    } catch (err: any) {
      setUserError(err.message || "An error occurred while saving the alliance.");
    } finally {
      setIsSavingAlliance(false);
    }
  };


  const tabs: { id: TabId; label: string; icon: typeof FileText; visible: boolean }[] = [
    { id: "blogs", label: "Blog Posts", icon: FileText, visible: canAccessBlogs },
    { id: "ads", label: "Ads", icon: Megaphone, visible: canAccessAds },
    { id: "alliances", label: "Alliances", icon: Handshake, visible: canAccessAlliances },
    { id: "users", label: "Team", icon: Users, visible: canAccessUsers },
  ];

  const formatViews = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);

  const inputClass = "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none";
  const labelClass = "mb-1 block font-heading text-xs text-muted-foreground tracking-wider uppercase";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12 sm:pt-24">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-body">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-wider text-foreground sm:text-3xl">
              <span className="text-primary text-glow">DASHBOARD</span>
            </h1>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Signed in as <span className="text-foreground">{user.name}</span>
              <span className={`ml-2 ${ROLE_LABELS[user.role].color}`}>({ROLE_LABELS[user.role].label})</span>
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === "blogs" && canAccessBlogs && (
              <Button onClick={handleNew} className="gap-2 gradient-red font-heading text-sm tracking-wide">
                <Plus className="h-4 w-4" /> New Post
              </Button>
            )}
            {activeTab === "ads" && canAccessAds && (
              <Button onClick={handleNewAd} className="gap-2 gradient-red font-heading text-sm tracking-wide">
                <Plus className="h-4 w-4" /> New Ad
              </Button>
            )}
            {activeTab === "alliances" && canAccessAlliances && (
              <Button onClick={() => { setEditingAlliance({ isNew: true, name: "", logo: "", url: "" }); setShowAllianceEditor(true); }} className="gap-2 gradient-red font-heading text-sm tracking-wide">
                <Plus className="h-4 w-4" /> New Alliance
              </Button>
            )}
            {activeTab === "users" && canAccessUsers && (
              <Button onClick={() => { setShowAddUser(true); setShowNewUserPassword(false); }} className="gap-2 gradient-red font-heading text-sm tracking-wide">
                <UserPlus className="h-4 w-4" /> Add User
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
          {[
            { label: "Total Posts", value: blogs.length, icon: FileText },
            { label: "Active Ads", value: ads.length, icon: Megaphone },
            { label: "Team Members", value: userCount, icon: Users },
            { label: "Total Views", value: formatViews(totalViews), icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
                {stat.label === "Total Views" && totalViews >= 1000 && (
                  <span className="text-[10px] font-body text-muted-foreground/60 tabular-nums" title="Exact view count">
                    ({totalViews.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
          {tabs.filter((t) => t.visible).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-heading text-xs font-semibold tracking-wider transition-all sm:px-4 sm:text-sm ${
                activeTab === tab.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {userError && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive font-body">{userError}</div>
        )}

        {/* === BLOGS TAB === */}
        {activeTab === "blogs" && canAccessBlogs && (
          <div className="space-y-3">
            {blogs.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="font-body text-sm text-muted-foreground">No blog posts yet.</p>
              </div>
            )}
            {blogs.map((blog) => (
              <div key={blog._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                <div className="h-20 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-24">
                  {blog.thumbnail ? (
                    <img src={`${blog.thumbnail.startsWith('http') ? '' : api.API_STATIC_BASE_URL}${blog.thumbnail}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-heading text-sm font-bold text-foreground sm:text-base">{blog.title || "Untitled"}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{blog.category || "Uncategorized"}</span>
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                    <span>{blog.authors?.map(a => a.name).join(', ') || blog.author || 'Unknown Author'}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:flex-shrink-0">
                  <Link to={`/blog/${blog._id}`} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => { setEditingBlog({ ...blog, authors: getAuthorsForEditor(blog) }); setShowEditor(true); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(blog._id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === ADS TAB === */}
        {activeTab === "ads" && canAccessAds && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-bold text-foreground">Rotation Interval</h3>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={60} value={rotationInterval}
                  onChange={(e) => setRotationInterval(Number(e.target.value))}
                  className="w-20 rounded-lg border border-border bg-secondary/50 px-3 py-2 font-body text-sm text-foreground text-center focus:border-primary focus:outline-none"
                />
                <span className="font-body text-sm text-muted-foreground">seconds between ad transitions</span>
              </div>
            </div>
            <div className="space-y-3">
              {ads.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <Megaphone className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="font-body text-sm text-muted-foreground">No ads yet. Click "New Ad" to add one.</p>
                </div>
              )}
              {ads.map((ad) => (
                <div key={ad._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                  <div className="h-20 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-24">
                    <img src={`${ad.horizontalImageUrl.startsWith('http') ? '' : api.API_STATIC_BASE_URL}${ad.horizontalImageUrl}`} alt={ad.label || "Ad"} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-heading text-sm font-bold text-foreground sm:text-base">{ad.label || "Untitled Ad"}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Image className="h-3 w-3" />2 images</span>
                      {ad.link && <span className="flex items-center gap-1 text-primary"><LinkIcon className="h-3 w-3" />Has link</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:flex-shrink-0">
                    <button onClick={() => handleEditAd(ad)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeAd(ad._id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ALLIANCES TAB === */}
        {activeTab === "alliances" && canAccessAlliances && (
          <div className="space-y-3">
            {alliances.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Handshake className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="font-body text-sm text-muted-foreground">No alliances yet. Click "New Alliance" to add one.</p>
              </div>
            )}
            {alliances.map((alliance) => (
              <div key={alliance._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
                  {alliance.logo ? (
                    <img src={`${alliance.logo.startsWith('http') ? '' : api.API_STATIC_BASE_URL}${alliance.logo}`} alt={alliance.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Handshake className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-heading text-sm font-bold text-foreground sm:text-base">{alliance.name || "Untitled"}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {alliance.url && alliance.url !== "#" && (
                      <a href={alliance.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <LinkIcon className="h-3 w-3" />{alliance.url}
                      </a>
                    )}
                    {(!alliance.url || alliance.url === "#") && (
                      <span className="text-muted-foreground/50">No link</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 sm:flex-shrink-0">
                  <button onClick={() => { setEditingAlliance({ ...alliance, isNew: false }); setShowAllianceEditor(true); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => removeAlliance(alliance._id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === "users" && canAccessUsers && (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const roleInfo = ROLE_LABELS[acc.role];
              const RoleIcon = roleInfo.icon;
              return (
                <div key={acc._id} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-heading text-sm font-bold text-primary">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isAdmin && editingDetails === acc._id ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded-md border border-border bg-secondary/50 px-2 py-1 text-sm font-heading font-semibold text-foreground focus:border-primary focus:outline-none" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground focus:border-primary focus:outline-none" />
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleAccountDetailsUpdate(acc._id)} className="rounded-md bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30">
                              <Save className="h-3 w-3" />
                            </button>
                            <button onClick={() => setEditingDetails(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-semibold text-foreground">{acc.name}</p>
                            <p className="text-[11px] text-muted-foreground">{acc.email}</p>
                          </div>
                          {isAdmin && (
                            <button onClick={() => { setEditingDetails(acc._id); setEditName(acc.name); setEditEmail(acc.email); setUserError(""); }}
                              className="flex-shrink-0 rounded-md p-1 text-muted-foreground/50 hover:text-primary transition-colors">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isAdmin && editingRole === acc._id ? (
                        <div className="flex items-center gap-1">
                          {(["admin", "editor", "ad_manager"] as UserRole[]).map((r) => (
                            <button key={r} onClick={() => handleRoleChange(acc._id, r)}
                              className={`rounded-md px-2 py-1 text-[10px] font-heading font-semibold transition-all ${
                                acc.role === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/20"
                              }`}
                            >
                              {ROLE_LABELS[r].label}
                            </button>
                          ))}
                          <button onClick={() => setEditingRole(null)} className="ml-1 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => isAdmin && acc.email.toLowerCase() !== "bangadhipati@gmail.com" && setEditingRole(acc._id)}
                          className={`flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-heading font-semibold ${roleInfo.color} ${
                            isAdmin && acc.email.toLowerCase() !== "bangadhipati@gmail.com" ? "cursor-pointer hover:bg-primary/20" : ""
                          }`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                          {isAdmin && acc.email.toLowerCase() !== "bangadhipati@gmail.com" && <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}

                      {isAdmin && editingPassword === acc._id ? (
                        <div className="flex items-center gap-1">
                          <div className="relative">
                            <input
                              type={showEditUserPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="New password"
                              className="w-32 rounded-md border border-border bg-secondary/50 pl-2 pr-8 py-1 text-xs font-body text-foreground focus:border-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEditUserPassword(!showEditUserPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showEditUserPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                          <button onClick={() => handlePasswordChange(acc._id)} className="rounded-md bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30">
                            <Save className="h-3 w-3" />
                          </button>
                          <button onClick={() => { setEditingPassword(null); setNewPassword(""); setShowEditUserPassword(false); }} className="text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : isAdmin && (
                        <button onClick={() => { setEditingPassword(acc._id); setNewPassword(""); setShowEditUserPassword(false); setUserError(""); }}
                          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                          <KeyRound className="h-3 w-3" /> Password
                        </button>
                      )}

                      {isAdmin && acc.email.toLowerCase() !== "bangadhipati@gmail.com" && (
                        <button onClick={() => handleAccountRemove(acc._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {showEditor && editingBlog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => { setShowEditor(false); setEditingBlog(null); }}>
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
              <h2 className="font-display text-lg font-bold text-primary">
                {editingBlog._id ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={() => { setShowEditor(false); setEditingBlog(null); }} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" value={editingBlog.title} onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Category</label>
                    <CategoryDropdown
                      value={editingBlog.category}
                      blogs={blogs}
                      onChange={(cat) => setEditingBlog({ ...editingBlog, category: cat })}
                      inputClass={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" value={editingBlog.date} onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Authors</label>
                  <div className="space-y-3">
                    {getAuthorsForEditor(editingBlog).map((author, idx) => (
                      <div key={idx} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-[10px] tracking-wider text-muted-foreground uppercase">Author {idx + 1}</span>
                          {(editingBlog.authors?.length || 1) > 1 && (
                            <button
                              type="button"
                              onClick={() => { // Ensure authors is always an array for operations
                                const updated = [...getAuthorsForEditor(editingBlog)];
                                updated.splice(idx, 1);
                                setEditingBlog({
                                  ...editingBlog,
                                  authors: updated,
                                  author: updated.map((a) => a.name).join(", "),
                                });
                              }}
                              className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={author.name}
                          onChange={(e) => {
                            const updated = [...getAuthorsForEditor(editingBlog)];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setEditingBlog({
                              ...editingBlog,
                              authors: updated,
                              author: updated.map((a) => a.name).filter(Boolean).join(", "),
                            });
                          }}
                          placeholder="Author name"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={author.bio || ""}
                          onChange={(e) => {
                            const updated = [...getAuthorsForEditor(editingBlog)];
                            updated[idx] = { ...updated[idx], bio: e.target.value };
                            setEditingBlog({ ...editingBlog, authors: updated });
                          }}
                          placeholder="Short bio (e.g. Computer Science Engineer · Core Member of GW)"
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const current = getAuthorsForEditor(editingBlog);
                        setEditingBlog({
                          ...editingBlog,
                          authors: [...current, { name: "", bio: "" }],
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs font-heading text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Another Author
                    </button>
                  </div>
                </div>
                <ImageUploadField
                  label="Thumbnail Image"
                  value={editingBlog.thumbnail}
                  onValueChange={(url) => setEditingBlog((prev) => ({ ...prev!, thumbnail: url }))}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
                <div>
                  <label className={labelClass}>Description <span className="text-muted-foreground/50">(optional)</span></label>
                  <input type="text" value={editingBlog.description || ""} onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Content (Markdown)</label>
                  <div className="mb-0 flex flex-wrap items-center gap-1 rounded-t-lg border border-border bg-secondary/30 p-1.5">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("**", "**")} title="Bold">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("*", "*")} title="Italic">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <div className="mx-1 h-4 w-px bg-border" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("# ")} title="Heading 1">
                      <Heading1 className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("## ")} title="Heading 2">
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("### ")} title="Heading 3">
                      <Heading3 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="mx-1 h-4 w-px bg-border" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("- ")} title="Bullet List">
                      <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("1. ")} title="Numbered List">
                      <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                    <div className="mx-1 h-4 w-px bg-border" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("> ")} title="Quote">
                      <Quote className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("`", "`")} title="Inline Code">
                      <Code className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("\n```\n", "\n```\n")} title="Code Block">
                      <SquareCode className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("\n---\n")} title="Horizontal Rule">
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <div className="mx-1 h-4 w-px bg-border" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => insertMarkdown("[", "](url)")} title="Insert Link">
                      <LinkIcon className="h-3.5 w-3.5" />
                    </Button>
                    
                    <div className="ml-auto flex items-center gap-1">
                      <input
                        type="file"
                        ref={contentImageInputRef}
                        onChange={handleContentImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isUploadingContentImage}
                        onClick={() => contentImageInputRef.current?.click()}
                        className="h-8 px-2 text-[10px] font-heading border border-primary/20 hover:bg-primary/10 text-primary uppercase tracking-wider transition-all"
                      >
                        {isUploadingContentImage ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        ) : (
                          <Image className="h-3 w-3 mr-1.5" />
                        )}
                        {isUploadingContentImage ? "..." : "Image"}
                      </Button>
                    </div>
                  </div>
                  <textarea 
                    ref={contentTextareaRef}
                    rows={12} 
                    value={editingBlog.content} 
                    onChange={(e) => {
                      const t = e.target;
                      const start = t.selectionStart;
                      const end = t.selectionEnd;
                      const scrollTop = t.scrollTop;
                      
                      setEditingBlog({ ...editingBlog, content: t.value });
                      
                      // Fix for cursor/scroll jumping in controlled components during heavy re-renders
                      requestAnimationFrame(() => {
                        if (contentTextareaRef.current) {
                          contentTextareaRef.current.setSelectionRange(start, end);
                          contentTextareaRef.current.scrollTop = scrollTop;
                        }
                      });
                    }}
                    className={`${inputClass} rounded-t-none resize-y font-mono text-xs leading-relaxed border-t-0`} 
                    placeholder="Write your content here. Use the toolbar above for formatting."
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground font-body">
                    Markdown supported. Select text and click buttons to format. For links, replace 'url' with your destination.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3 sm:px-6">
              <Button variant="outline" disabled={isSavingBlog} onClick={() => { setShowEditor(false); setEditingBlog(null); }} className="font-heading text-sm">Cancel</Button>
              <Button onClick={handleSave} disabled={isSavingBlog} className="gradient-red font-heading text-sm tracking-wide min-w-[120px]">
                {isSavingBlog ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Editor Modal */}
      {showAdEditor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => { setShowAdEditor(false); setEditingAd({}); }}>
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
              <h2 className="font-display text-lg font-bold text-primary">{editingAd.isNew ? "New Ad" : "Edit Ad"}</h2>
              <button onClick={() => { setShowAdEditor(false); setEditingAd({}); }} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                <ImageUploadField
                  label="Horizontal Image (3:1)"
                  required
                  value={editingAd.horizontalImageUrl || ""}
                  onValueChange={(url) => setEditingAd((prev) => ({ ...prev!, horizontalImageUrl: url }))}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  placeholder="https://example.com/ad-h.jpg"
                  previewClass="aspect-[3/1]"
                />
                <ImageUploadField
                  label="Vertical Image (1:2)"
                  required
                  value={editingAd.verticalImageUrl || ""}
                  onValueChange={(url) => setEditingAd((prev) => ({ ...prev!, verticalImageUrl: url }))}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  placeholder="https://example.com/ad-v.jpg"
                  previewClass="aspect-[1/2] max-h-48 w-24"
                />
                <div>
                  <label className={labelClass}>Label <span className="text-muted-foreground/50">(optional)</span></label>
                  <input type="text" value={editingAd.label || ""} onChange={(e) => setEditingAd({ ...editingAd, label: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Link URL <span className="text-muted-foreground/50">(optional)</span></label>
                  <input type="text" value={editingAd.link || ""} onChange={(e) => setEditingAd({ ...editingAd, link: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3 sm:px-6">
              <Button variant="outline" disabled={isSavingAd} onClick={() => { setShowAdEditor(false); setEditingAd({}); }} className="font-heading text-sm">Cancel</Button>
              <Button onClick={handleSaveAd} disabled={isSavingAd || !editingAd.horizontalImageUrl || !editingAd.verticalImageUrl} className="gradient-red font-heading text-sm tracking-wide min-w-[120px]">
                {isSavingAd ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Ad
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAddUser(false)}>
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAddUser(false)} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <h2 className="mb-4 font-display text-lg font-bold text-primary">Add User</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <div className="flex gap-2">
                  {(["admin", "editor", "ad_manager"] as UserRole[]).map((r) => (
                    <button key={r} onClick={() => setNewUser({ ...newUser, role: r })}
                      className={`flex-1 rounded-lg py-2 text-xs font-heading font-semibold transition-all ${
                        newUser.role === r ? "bg-primary text-primary-foreground" : "border border-border bg-secondary/50 text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {ROLE_LABELS[r].label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddUser} className="w-full gradient-red font-heading text-sm tracking-wide">
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alliance Editor Modal */}
      {showAllianceEditor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => { setShowAllianceEditor(false); setEditingAlliance({}); }}>
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
              <h2 className="font-display text-lg font-bold text-primary">{editingAlliance.isNew ? "New Alliance" : "Edit Alliance"}</h2>
              <button onClick={() => { setShowAllianceEditor(false); setEditingAlliance({}); }} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Name <span className="text-destructive">*</span></label>
                  <input type="text" value={editingAlliance.name || ""} onChange={(e) => setEditingAlliance({ ...editingAlliance, name: e.target.value })} placeholder="Alliance name" className={inputClass} />
                </div>
                <ImageUploadField
                  label="Logo"
                  required
                  value={editingAlliance.logo || ""}
                  onValueChange={(url) => setEditingAlliance((prev) => ({ ...prev!, logo: url }))}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  placeholder="https://example.com/logo.png"
                  previewClass="aspect-square max-h-24 w-24"
                />
                <div>
                  <label className={labelClass}>Link URL <span className="text-muted-foreground/50">(optional)</span></label>
                  <input type="text" value={editingAlliance.url || ""} onChange={(e) => setEditingAlliance({ ...editingAlliance, url: e.target.value })} placeholder="https://example.com" className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3 sm:px-6">
              <Button variant="outline" disabled={isSavingAlliance} onClick={() => { setShowAllianceEditor(false); setEditingAlliance({}); }} className="font-heading text-sm">Cancel</Button>
              <Button
                onClick={handleSaveAlliance}
                disabled={isSavingAlliance || !editingAlliance.name || !editingAlliance.logo}
                className="gradient-red font-heading text-sm tracking-wide min-w-[140px]"
              >
                {isSavingAlliance ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Alliance
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;