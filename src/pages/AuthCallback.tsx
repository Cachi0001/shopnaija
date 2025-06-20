
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, subdomain, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) {
      console.log("AuthCallback: Waiting for auth state to load...");
      return;
    }

    const handleCallback = async () => {
      try {
        console.log("AuthCallback: User object:", user);
        console.log("AuthCallback: Subdomain:", subdomain);

        if (user) {
          console.log("User role:", user.role);

          toast({
            title: "Authentication successful",
            description: `Welcome ${user.name}! Redirecting to your dashboard...`,
          });

          // Add delay to ensure state is properly set
          setTimeout(() => {
            if (user.role === 'superadmin') {
              console.log("Redirecting superadmin to /dashboard");
              navigate("/dashboard", { replace: true });
            } else if (user.role === 'admin') {
              console.log("Redirecting admin to /admin/dashboard");
              if (user.subdomain) {
                navigate("/admin/dashboard", { replace: true });
              } else {
                toast({
                  title: "Setup Required",
                  description: "Your admin account needs to be configured. Please contact support.",
                  variant: "destructive",
                });
                navigate("/auth", { replace: true });
              }
            } else {
              console.log("Redirecting customer/other to home");
              navigate("/", { replace: true });
            }
          }, 1500);
        } else {
          console.log("No user found after auth callback");
          toast({
            title: "Authentication failed",
            description: "Please try logging in again.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          title: "Authentication error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    };

    // Add a delay to ensure auth state is fully loaded
    const timeoutId = setTimeout(handleCallback, 500);
    
    return () => clearTimeout(timeoutId);
  }, [loading, user, navigate, toast, subdomain]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we verify your account and redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
