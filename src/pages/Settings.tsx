import { useState } from "react";
import { ArrowLeft, Bell, Lock, User, Moon, Globe, Shield, MessageCircle, Zap, Users as UsersIcon, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [storyNotifications, setStoryNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Account Section */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Change Password
            </Button>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Blocked Users
            </Button>
          </div>
        </section>

        {/* Messages Settings */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications" className="flex-1">
                Message Notifications
              </Label>
              <Switch
                id="message-notifications"
                checked={messageNotifications}
                onCheckedChange={setMessageNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="read-receipts" className="flex-1">
                Read Receipts
              </Label>
              <Switch
                id="read-receipts"
                checked={readReceipts}
                onCheckedChange={setReadReceipts}
              />
            </div>
          </div>
        </section>

        {/* Stories Settings */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Stories</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="story-notifications" className="flex-1">
              Story Notifications
            </Label>
            <Switch
              id="story-notifications"
              checked={storyNotifications}
              onCheckedChange={setStoryNotifications}
            />
          </div>
        </section>

        {/* Friends Settings */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Friends</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="friend-requests" className="flex-1">
                Friend Request Notifications
              </Label>
              <Switch
                id="friend-requests"
                checked={friendRequests}
                onCheckedChange={setFriendRequests}
              />
            </div>
            <Separator />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/friends")}
            >
              Manage Friends
            </Button>
          </div>
        </section>

        {/* Groups Settings */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <UsersRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Groups</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="group-notifications" className="flex-1">
                Group Notifications
              </Label>
              <Switch
                id="group-notifications"
                checked={groupNotifications}
                onCheckedChange={setGroupNotifications}
              />
            </div>
            <Separator />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/groups")}
            >
              Manage Groups
            </Button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex-1">
                Push Notifications
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/notifications")}
            >
              View All Notifications
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex-1">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <Separator />
            
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              Language
            </Button>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Two-Factor Authentication
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Active Sessions
            </Button>
          </div>
        </section>

        {/* Logout Section */}
        <section className="bg-card rounded-lg border border-border p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              // Add logout logic here
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
