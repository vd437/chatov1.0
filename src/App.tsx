import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Index from "./pages/Index";
import UserSearch from "./pages/UserSearch";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import Verification from "./pages/Verification";
import EmailLink from "./pages/EmailLink";
import EmailVerification from "./pages/EmailVerification";
import Home from "./pages/Home";
import ChatList from "./pages/ChatList";
import ChatDetail from "./pages/ChatDetail";
import ForwardMessage from "./pages/ForwardMessage";
import Report from "./pages/Report";
import Stories from "./pages/Stories";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
import Groups from "./pages/Groups";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/email-link" element={<EmailLink />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          
          {/* Main app routes */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<ChatDetail />} />
            <Route path="/forward-message" element={<ForwardMessage />} />
            <Route path="/report/:chatId" element={<Report />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/user-search" element={<UserSearch />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
