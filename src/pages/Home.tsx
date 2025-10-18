import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, PartyPopper, Users, Send, Shield, User } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      // After showing the welcome page once, clear the new user flag
      // and navigate to chats on next visit
      const timer = setTimeout(() => {
        localStorage.removeItem("isNewUser");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              chato chato
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl shadow-card border border-border p-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}
