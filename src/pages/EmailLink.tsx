import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

export default function EmailLink() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("pendingEmail", email);
      navigate("/email-verification");
    }, 1000);
  };

  const handleSkip = () => {
    localStorage.setItem("isAuthenticated", "true");
    toast.success("Account created successfully!");
    navigate("/home");
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-warm mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Link Your Email</h2>
          <p className="text-muted-foreground text-sm">
            Add your email to recover your account and receive verification codes
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-card border-input"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all shadow-soft font-medium"
            >
              {isLoading ? "Loading..." : "Continue"}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
