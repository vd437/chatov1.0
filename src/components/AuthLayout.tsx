import { ReactNode } from "react";
import { MessageSquare } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-glow">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            chato chato
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with friends and family
          </p>
        </div>
        <div className="bg-card rounded-3xl shadow-card border border-border p-8 animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}
