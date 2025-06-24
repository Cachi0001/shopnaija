import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/AuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Github } from "lucide-react";
import LoadingFallback from "@/components/LoadingFallback";

interface LoginModalProps {
  children: React.ReactNode;
}

const LoginModal = ({ children }: LoginModalProps) => {
  const { timeout } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let loadingTimeout: NodeJS.Timeout | null = null;
    // 15s timeout for login
    loadingTimeout = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Login Timeout",
        description: "Login took too long. Please try again.",
        variant: "destructive",
      });
      console.error('[LoginModal] Login timed out after 15 seconds.');
    }, 15000);
    try {
      const isEmail = emailOrPhone.includes('@');
      
      if (isEmail) {
        await AuthService.signIn(emailOrPhone, password);
      } else {
        await AuthService.signInWithPhone(emailOrPhone, password);
      }

      const user = await AuthService.getCurrentUser();
      
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        setOpen(false);
        
        toast({
          title: "Login successful",
          description: `Welcome ${user.name}! Redirecting...`,
        });

        setTimeout(() => {
          if (user.role === 'superadmin') {
            navigate("/dashboard");
          } else if (user.role === 'admin') {
            navigate("/admin/dashboard");
          } else {
            toast({
              title: "Setup Required",
              description: "Your account needs configuration. Contact support.",
              variant: "destructive",
            });
          }
        }, 1000);
      } else {
        toast({
          title: "Access denied",
          description: "This login is for admins and superadmins only.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      await AuthService.signInWithOAuth(provider);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Social login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
    setOpen(false);
  };

  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold text-gray-900">
              Login
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Access your dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Email/Phone Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
                  Email or Phone Number
                </Label>
                <Input
                  id="emailOrPhone"
                  type="text"
                  placeholder="admin@example.com or 08012345678"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="h-10 text-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 text-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: '#00A862' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                onClick={handleForgotPassword}
                className="text-sm font-medium hover:underline"
                style={{ color: '#00A862' }}
              >
                Forgot your password?
              </button>
            </div>

            {/* Info for new admins */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                <strong>New Admin?</strong> Only superadmins can register new admin accounts. 
                Contact support if you need an admin account created.
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
