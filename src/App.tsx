import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdProvider } from "@/contexts/AdContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { AllianceProvider } from "@/contexts/AllianceContext";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <AdProvider>
      <AllianceProvider>
      <BlogProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BlogProvider>
      </AllianceProvider>
      </AdProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;