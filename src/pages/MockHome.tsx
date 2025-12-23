import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useMockAuth();
  const { groups, getUserMembership } = useMockData();

  const userGroups = groups.filter((g) => {
    const membership = getUserMembership(g.id, user?.id || "");
    return membership && !membership.is_banned;
  });

  const handleLogout = () => {
    logout();
    navigate("/mock-auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Welcome, {user?.username}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-all cursor-pointer"
            onClick={() => navigate("/mock-groups")}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Groups</h2>
                <p className="text-sm text-muted-foreground">
                  {userGroups.length} group{userGroups.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Chat with your groups and create new ones
            </p>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-all cursor-pointer opacity-50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Messages</h2>
                <p className="text-sm text-muted-foreground">Direct messages</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Coming soon - Private chats
            </p>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-all cursor-pointer opacity-50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Friends</h2>
                <p className="text-sm text-muted-foreground">Manage friends</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Coming soon - Add and manage friends
            </p>
          </div>

          <div
            className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-all cursor-pointer opacity-50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Settings</h2>
                <p className="text-sm text-muted-foreground">App settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Coming soon - Customize your experience
            </p>
          </div>
        </div>

        <div className="mt-8 bg-accent/20 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Demo Mode - All data is stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockHome;
