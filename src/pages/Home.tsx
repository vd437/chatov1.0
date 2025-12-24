import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, PartyPopper, Users, User } from "lucide-react";
import { useMockAuth } from "@/contexts/MockAuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useMockAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate("/auth");
  }, [isLoading, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                chato chato
              </h1>
              {user ? (
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium">{user.username}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/profile")} variant="outline" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          <section className="bg-card rounded-3xl shadow-card border border-border p-8">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/chats")}
              >
                <MessageSquare className="w-6 h-6" />
                <span>Messages</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/stories")}
              >
                <PartyPopper className="w-6 h-6" />
                <span>Stories</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/friends")}
              >
                <Users className="w-6 h-6" />
                <span>Friends</span>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

