import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import LoadingFallback from "@/components/LoadingFallback";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading, subdomain } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    const handleRedirect = () => {
      if (!user) {
        toast({
          title: "Authentication Failed",
          description: "Please try logging in again",
          variant: "destructive"
        });
        return navigate("/login", { replace: true });
      }

      // Determine redirect path based on role and subdomain
      let redirectPath = "/";
      
      if (user.role === 'superadmin') {
        redirectPath = "/dashboard";
      } else if (user.role === 'admin') {
        redirectPath = "/admin/dashboard";
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`
      });

      // Ensure complete URL for subdomain redirects
      if (redirectPath.startsWith('http')) {
        window.location.href = redirectPath;
      } else {
        navigate(redirectPath, { replace: true });
      }
    };

    const timer = setTimeout(handleRedirect, 1000);
    return () => clearTimeout(timer);
  }, [user, loading, navigate, toast, subdomain]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingFallback message="Loading..." />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;