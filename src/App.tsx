import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Index from "./pages/Index";
import UserSearch from "./pages/UserSearch";
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
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Local-only auth + data
import MockAuth from "./pages/MockAuth";
import MockGroups from "./pages/MockGroups";
import MockCreateGroup from "./pages/MockCreateGroup";
import MockGroupDetail from "./pages/MockGroupDetail";
import MockGroupProfile from "./pages/MockGroupProfile";
import JoinGroup from "./pages/JoinGroup";
import MockUserProfile from "./pages/MockUserProfile";
import CallScreen from "./pages/CallScreen";

import { MockAuthProvider } from "@/contexts/MockAuthContext";
import { MockDataProvider } from "@/contexts/MockDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MockAuthProvider>
        <MockDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Local-only auth + data (no backend) */}
              <Route path="/auth" element={<MockAuth />} />
              <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
              <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />

              {/* Join group by invite link */}
              <Route path="/join-group" element={<JoinGroup />} />
              <Route path="/join-group/:inviteCode" element={<JoinGroup />} />

              {/* Legacy verification routes (kept, but no longer required in local mode) */}
              <Route path="/verification" element={<Verification />} />
              <Route path="/email-link" element={<EmailLink />} />
              <Route path="/email-verification" element={<EmailVerification />} />

              {/* Main app routes */}
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Navigate to="/chats" replace />} />
                <Route path="/chats" element={<ChatList />} />
              <Route path="/chat/:chatId" element={<ChatDetail />} />
              <Route path="/call/:userId" element={<CallScreen />} />
                <Route path="/forward-message" element={<ForwardMessage />} />
                <Route path="/report/:chatId" element={<Report />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<MockUserProfile />} />
                <Route path="/user-search" element={<UserSearch />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Groups (local) */}
                <Route path="/groups" element={<MockGroups />} />
                <Route path="/create-group" element={<MockCreateGroup />} />
                <Route path="/group/:groupId" element={<MockGroupDetail />} />
                <Route path="/group/:groupId/profile" element={<MockGroupProfile />} />

                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MockDataProvider>
      </MockAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

