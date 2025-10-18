import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const email = localStorage.getItem("pendingEmail");

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsVerified(true);
        setIsLoading(false);
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          localStorage.removeItem("pendingEmail");
          navigate("/home");
        }, 2000);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsVerified(true);
        setTimeout(() => {
          localStorage.removeItem("pendingEmail");
          navigate("/home");
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [email, navigate]);

  const handleContinue = async () => {
    setIsLoading(true);
    
    // Check if user is signed in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      localStorage.removeItem("pendingEmail");
      toast.success("Account verified successfully!");
      navigate("/home");
    } else {
      toast.info("Please check your email and click the verification link, then come back here.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      toast.error("Failed to resend email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 mb-3">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Email Verified!</h2>
          <p className="text-muted-foreground text-sm">
            Your account has been successfully verified. Redirecting to home...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Signup</span>
        </button>

        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-warm mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Verify Your Email</h2>
          <p className="text-muted-foreground text-sm">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Please check your email and click the verification link. Since auto-confirm is enabled, your account should be ready immediately.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all shadow-soft font-medium"
          >
            {isLoading ? "Checking..." : "Continue to Home"}
          </Button>

          <Button
            onClick={handleResend}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12"
          >
            Resend Verification Email
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                localStorage.removeItem("pendingEmail");
                navigate("/login");
              }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Already verified? Sign in
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
