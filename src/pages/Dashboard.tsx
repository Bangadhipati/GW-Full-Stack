import { useState, useEffect, useRef, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Edit, Trash2, Eye, Users, FileText, X, Save,
  Megaphone, Image, Link as LinkIcon, Clock, Shield, PenLine, BarChart3,
  KeyRound, UserPlus, ChevronDown, Upload, Handshake,
} from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useAds } from "@/contexts/AdContext";
import { useAlliances, Alliance } from "@/contexts/AllianceContext";
import { useBlogs } from "@/contexts/BlogContext";
import { Ad } from "@/data/ads";
import { BlogPost, BlogAuthor } from "@/data/blogs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

interface ImageUploadFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (url: string) => void;
  inputClass: string;
  labelClass: string;
  placeholder?: string;
  previewClass?: string;
}

const ImageUploadField = ({ label, required, value, onValueChange, inputClass, labelClass, placeholder, previewClass }: ImageUploadFieldProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      onValueChange(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onValueChange(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={value.startsWith("data:") ? "File uploaded ✓" : placeholder || "https://example.com/image.jpg"}
          className={`${inputClass} flex-1`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-heading text-muted-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {value && (
        <div className={`mt-2 overflow-hidden rounded-lg border border-border ${previewClass || "aspect-video max-h-40"}`}>
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
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
  const { user, isAdmin, hasRole, accounts, updatePassword, addAccount, removeAccount, updateAccountRole, updateAccountDetails } = useAuth();
  const { ads, rotationInterval, addAd, removeAd, updateAd, setRotationInterval } = useAds();
  const { alliances, addAlliance, updateAlliance, removeAlliance } = useAlliances();
  const { blogs, addBlog, updateBlog, removeBlog, totalViews } = useBlogs();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  type TabId = "blogs" | "users" | "ads" | "alliances";
  const canAccessBlogs = isAdmin || hasRole("editor");
  const canAccessAds = isAdmin || hasRole("ad_manager");
  const canAccessUsers = isAdmin;
  const canAccessAlliances = isAdmin;

  const defaultTab: TabId = canAccessBlogs ? "blogs" : canAccessAds ? "ads" : "users";
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAdEditor, setShowAdEditor] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Ad> & { isNew?: boolean }>({});

  // Alliance management state
  const [showAllianceEditor, setShowAllianceEditor] = useState(false);
  const [editingAlliance, setEditingAlliance] = useState<Partial<Alliance> & { isNew?: boolean }>({});

  // User management state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "", role: "editor" as UserRole });
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [userError, setUserError] = useState("");

  if (!user) return <Navigate to="/" replace />;

  // Blog handlers
  const handleDelete = (id: string) => removeBlog(id);
  const handleSave = () => {
    if (!editingBlog) return;
    const exists = blogs.find((b) => b.id === editingBlog.id);
    if (exists) updateBlog(editingBlog.id, editingBlog);
    else addBlog(editingBlog);
    setShowEditor(false);
    setEditingBlog(null);
  };
  const handleNew = () => {
    setEditingBlog({
      id: `blog-${Date.now()}`,
      title: "", description: "", content: "", thumbnail: "",
      date: new Date().toISOString().split("T")[0],
      author: user.name + " and Team GW", category: "",
    });
    setShowEditor(true);
  };

  // Ad handlers
  const handleNewAd = () => {
    setEditingAd({ isNew: true, horizontalImageUrl: "", verticalImageUrl: "", link: "", label: "" });
    setShowAdEditor(true);
  };
  const handleEditAd = (ad: Ad) => {
    setEditingAd({ ...ad, isNew: false });
    setShowAdEditor(true);
  };
  const handleSaveAd = () => {
    if (!editingAd.horizontalImageUrl || !editingAd.verticalImageUrl) return;
    const payload = {
      horizontalImageUrl: editingAd.horizontalImageUrl,
      verticalImageUrl: editingAd.verticalImageUrl,
      link: editingAd.link || undefined,
      label: editingAd.label || undefined,
    };
    if (editingAd.isNew) addAd(payload);
    else if (editingAd.id) updateAd(editingAd.id, payload);
    setShowAdEditor(false);
    setEditingAd({});
  };

  // User handlers
  const handleAddUser = () => {
    setUserError("");
    if (!newUser.email || !newUser.name || !newUser.password) {
      setUserError("All fields are required");
      return;
    }
    const err = addAccount(newUser);
    if (err) { setUserError(err); return; }
    setShowAddUser(false);
    setNewUser({ email: "", name: "", password: "", role: "editor" });
  };
  const handlePasswordChange = (email: string) => {
    const err = updatePassword(email, newPassword);
    if (err) { setUserError(err); return; }
    setEditingPassword(null);
    setNewPassword("");
    setUserError("");
  };
  const handleRoleChange = (email: string, role: UserRole) => {
    const err = updateAccountRole(email, role);
    if (err) setUserError(err);
    else setEditingRole(null);
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
              <Button onClick={() => setShowAddUser(true)} className="gap-2 gradient-red font-heading text-sm tracking-wide">
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
            { label: "Team Members", value: accounts.length, icon: Users },
            { label: "Total Views", value: formatViews(totalViews), icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="mt-1 font-display text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
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
              <div key={blog.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                <div className="h-20 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-24">
                  {blog.thumbnail ? (
                    <img src={blog.thumbnail} alt="" className="h-full w-full object-cover" />
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
                    <span>{blog.date}</span>
                    <span>{blog.author}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:flex-shrink-0">
                  <Link to={`/blog/${blog.id}`} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => { setEditingBlog({ ...blog }); setShowEditor(true); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
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
                <div key={ad.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                  <div className="h-20 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-24">
                    <img src={ad.horizontalImageUrl} alt={ad.label || "Ad"} className="h-full w-full object-cover" />
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
                    <button onClick={() => removeAd(ad.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
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
              <div key={alliance.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
                  {alliance.logo ? (
                    <img src={alliance.logo} alt={alliance.name} className="h-full w-full object-contain p-1" />
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
                  <button onClick={() => removeAlliance(alliance.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
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
            {userError && (
              <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive font-body">{userError}</div>
            )}
            {accounts.map((acc) => {
              const roleInfo = ROLE_LABELS[acc.role];
              const RoleIcon = roleInfo.icon;
              return (
                <div key={acc.email} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-heading text-sm font-bold text-primary">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingDetails === acc.email ? (
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
                            <button onClick={() => {
                              setUserError("");
                              const err = updateAccountDetails(acc.email, { name: editName, email: editEmail });
                              if (err) setUserError(err);
                              else setEditingDetails(null);
                            }} className="rounded-md bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30">
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
                          <button onClick={() => { setEditingDetails(acc.email); setEditName(acc.name); setEditEmail(acc.email); setUserError(""); }}
                            className="flex-shrink-0 rounded-md p-1 text-muted-foreground/50 hover:text-primary transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {editingRole === acc.email ? (
                        <div className="flex items-center gap-1">
                          {(["admin", "editor", "ad_manager"] as UserRole[]).map((r) => (
                            <button key={r} onClick={() => handleRoleChange(acc.email, r)}
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
                          onClick={() => acc.email.toLowerCase() !== "bangadhipati@gmail.com" && setEditingRole(acc.email)}
                          className={`flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-heading font-semibold ${roleInfo.color} ${
                            acc.email.toLowerCase() !== "bangadhipati@gmail.com" ? "cursor-pointer hover:bg-primary/20" : ""
                          }`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                          {acc.email.toLowerCase() !== "bangadhipati@gmail.com" && <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}

                      {editingPassword === acc.email ? (
                        <div className="flex items-center gap-1">
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password" className="w-28 rounded-md border border-border bg-secondary/50 px-2 py-1 text-xs font-body text-foreground focus:border-primary focus:outline-none" />
                          <button onClick={() => handlePasswordChange(acc.email)} className="rounded-md bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30">
                            <Save className="h-3 w-3" />
                          </button>
                          <button onClick={() => { setEditingPassword(null); setNewPassword(""); }} className="text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingPassword(acc.email); setNewPassword(""); setUserError(""); }}
                          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                          <KeyRound className="h-3 w-3" /> Password
                        </button>
                      )}

                      {acc.email.toLowerCase() !== "bangadhipati@gmail.com" && (
                        <button onClick={() => removeAccount(acc.email)}
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
                {editingBlog.title ? "Edit Post" : "New Post"}
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
                    {(editingBlog.authors && editingBlog.authors.length > 0
                      ? editingBlog.authors
                      : [{ name: editingBlog.author || "", bio: "" }]
                    ).map((author, idx) => (
                      <div key={idx} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-[10px] tracking-wider text-muted-foreground uppercase">Author {idx + 1}</span>
                          {(editingBlog.authors?.length || 1) > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingBlog.authors || [])];
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
                            const updated = [...(editingBlog.authors || [{ name: editingBlog.author || "", bio: "" }])];
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
                          value={author.bio}
                          onChange={(e) => {
                            const updated = [...(editingBlog.authors || [{ name: editingBlog.author || "", bio: "" }])];
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
                        const current = editingBlog.authors && editingBlog.authors.length > 0
                          ? editingBlog.authors
                          : [{ name: editingBlog.author || "", bio: "" }];
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
                  onValueChange={(url) => setEditingBlog({ ...editingBlog, thumbnail: url })}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
                <div>
                  <label className={labelClass}>Description</label>
                  <input type="text" value={editingBlog.description} onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Content (Markdown)</label>
                  <textarea rows={10} value={editingBlog.content} onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })} className={`${inputClass} resize-y`} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3 sm:px-6">
              <Button variant="outline" onClick={() => { setShowEditor(false); setEditingBlog(null); }} className="font-heading text-sm">Cancel</Button>
              <Button onClick={handleSave} className="gradient-red font-heading text-sm tracking-wide">
                <Save className="mr-2 h-4 w-4" /> Save Post
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
                  onValueChange={(url) => setEditingAd({ ...editingAd, horizontalImageUrl: url })}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  placeholder="https://example.com/ad-h.jpg"
                  previewClass="aspect-[3/1]"
                />
                <ImageUploadField
                  label="Vertical Image (1:2)"
                  required
                  value={editingAd.verticalImageUrl || ""}
                  onValueChange={(url) => setEditingAd({ ...editingAd, verticalImageUrl: url })}
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
              <Button variant="outline" onClick={() => { setShowAdEditor(false); setEditingAd({}); }} className="font-heading text-sm">Cancel</Button>
              <Button onClick={handleSaveAd} disabled={!editingAd.horizontalImageUrl || !editingAd.verticalImageUrl} className="gradient-red font-heading text-sm tracking-wide">
                <Save className="mr-2 h-4 w-4" /> Save Ad
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
            {userError && <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive font-body">{userError}</p>}
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
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={inputClass} />
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
                  onValueChange={(url) => setEditingAlliance({ ...editingAlliance, logo: url })}
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
              <Button variant="outline" onClick={() => { setShowAllianceEditor(false); setEditingAlliance({}); }} className="font-heading text-sm">Cancel</Button>
              <Button
                onClick={() => {
                  if (!editingAlliance.name || !editingAlliance.logo) return;
                  if (editingAlliance.isNew) {
                    addAlliance({ name: editingAlliance.name, logo: editingAlliance.logo, url: editingAlliance.url || "#" });
                  } else if (editingAlliance.id) {
                    updateAlliance(editingAlliance.id, { name: editingAlliance.name, logo: editingAlliance.logo, url: editingAlliance.url || "#" });
                  }
                  setShowAllianceEditor(false);
                  setEditingAlliance({});
                }}
                disabled={!editingAlliance.name || !editingAlliance.logo}
                className="gradient-red font-heading text-sm tracking-wide"
              >
                <Save className="mr-2 h-4 w-4" /> Save Alliance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;