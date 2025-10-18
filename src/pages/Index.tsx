import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Shield, Zap, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const isNewUser = localStorage.getItem("isNewUser");
    
    if (isAuthenticated) {
      if (isNewUser === "true") {
        // Clear the flag and show welcome page
        localStorage.removeItem("isNewUser");
        navigate("/home");
      } else {
        // Existing user, go to chats
        navigate("/chats");
      }
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow animate-pulse-glow">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            chato chato
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The next generation messaging platform. Connect, share, and communicate with friends and family around the world.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full sm:w-auto h-14 px-8 text-lg font-medium border-2 border-primary hover:bg-primary/10"
          >
            <Globe className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto h-14 px-8 bg-gradient-primary hover:opacity-90 transition-all shadow-soft text-lg font-medium"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            variant="outline"
            className="w-full sm:w-auto h-14 px-8 text-lg font-medium border-2 border-primary hover:bg-primary/10"
          >
            Create Account
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
            <p className="text-muted-foreground text-sm">
              Your conversations are encrypted and protected
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm">
              Messages delivered instantly, anywhere in the world
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <Globe className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Global Connection</h3>
            <p className="text-muted-foreground text-sm">
              Connect with anyone, anywhere, anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
