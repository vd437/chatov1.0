import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Shield, Zap, Globe } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const isNewUser = localStorage.getItem("isNewUser");

    if (isAuthenticated) {
      if (isNewUser === "true") {
        localStorage.removeItem("isNewUser");
        navigate("/home");
      } else {
        navigate("/chats");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <main className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
        <header className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow animate-pulse-glow">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            chato chato
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The next generation messaging platform. Connect, share, and communicate
            with friends and family around the world.
          </p>
        </header>

        <section className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            onClick={() => navigate("/auth")}
            className="w-full sm:w-auto h-14 px-8 bg-gradient-primary hover:opacity-90 transition-all shadow-soft text-lg font-medium"
          >
            Log In or Create Account
          </Button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <article className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-semibold text-lg mb-2">Secure & Private</h2>
            <p className="text-muted-foreground text-sm">
              Your conversations are encrypted and protected
            </p>
          </article>
          <article
            className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h2 className="font-semibold text-lg mb-2">Lightning Fast</h2>
            <p className="text-muted-foreground text-sm">
              Messages delivered instantly, anywhere in the world
            </p>
          </article>
          <article
            className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <Globe className="w-6 h-6 text-success" />
            </div>
            <h2 className="font-semibold text-lg mb-2">Global Connection</h2>
            <p className="text-muted-foreground text-sm">
              Connect with anyone, anywhere, anytime
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Index;

