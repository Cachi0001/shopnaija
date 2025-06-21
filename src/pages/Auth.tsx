import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/AuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Github } from "lucide-react";
import LoadingFallback from "@/components/LoadingFallback";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [nin, setNin] = useState("");
  
  const { subdomain, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      if (user.role === 'superadmin') {
        navigate("/dashboard", { replace: true });
      } else if (user.role === 'admin' && user.subdomain) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  const isAdminSubdomain = subdomain && subdomain !== 'superadmin';
  const isSuperAdminSubdomain = subdomain === 'superadmin';

  const validateNIN = (ninValue: string): boolean => {
    // Nigerian NIN validation: 11 digits
    const ninRegex = /^\d{11}$/;
    return ninRegex.test(ninValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let loadingTimeout: NodeJS.Timeout | null = null;
    // 15s timeout for login/signup
    loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login/Signup Timeout",
        description: "Authentication took too long. Please try again.",
        variant: "destructive",
      });
      console.error('[AuthPage] Login/Signup timed out after 15 seconds.');
    }, 15000);
    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      clearTimeout(timeout);

      // Force navigation after login
      setTimeout(() => {
        if (isSuperAdmin) {
          navigate("/dashboard", { replace: true });
        } else if (isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 1000); // 1 second delay for UX
    } catch (error) {
      clearTimeout(timeout);
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.user) {
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting...",
        });
        
        // Get user profile to determine redirect
        const userProfile = await AuthService.getCurrentUser();
        
        setTimeout(() => {
          if (userProfile?.role === 'superadmin') {
            navigate("/dashboard", { replace: true });
          } else if (userProfile?.role === 'admin' && userProfile.subdomain) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.signInWithPhone(phone, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate NIN for admin signups
    if ((isSuperAdminSubdomain || isAdminSubdomain) && !validateNIN(nin)) {
      toast({
        title: "Invalid NIN",
        description: "Please enter a valid 11-digit Nigerian National Identification Number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name,
        role: (isSuperAdminSubdomain || isAdminSubdomain) ? 'admin' as const : 'customer' as const,
        ...(nin && { nin }),
        ...(subdomain && { subdomain }),
      };

      await AuthService.signUp(email, password, userData);
      
      toast({
        title: "Account created",
        description: "Please check your email for verification link.",
      });
      
      setAuthMode('login');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.signUpWithPhone(phone, password, {
        name,
        role: 'customer'
      });
      
      toast({
        title: "Account created",
        description: "Please check your phone for verification code.",
      });
      
      setAuthMode('login');
    } catch (error: any) {
      console.error("Phone signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter') => {
    setIsLoading(true);

    try {
      await AuthService.signInWithOAuth(provider);
    } catch (error: any) {
      console.error("Social login error:", error);
      toast({
        title: "Social login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBrandingTitle = () => {
    if (isSuperAdminSubdomain) return "GrowthSmallBeez Admin";
    if (isAdminSubdomain) return `${subdomain} Admin Portal`;
    return "GrowthSmallBeez";
  };

  const getBrandingDescription = () => {
    if (isSuperAdminSubdomain) return "Super Admin Portal";
    if (isAdminSubdomain) return "Admin Dashboard Access";
    return "Your Nigerian E-commerce Platform";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              {getBrandingTitle()}
            </CardTitle>
            <CardDescription>
              {getBrandingDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {/* Admin Social Login Options */}
                {(isSuperAdminSubdomain || isAdminSubdomain) && (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      Admin Login - Social accounts or email/phone
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Continue with Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('github')}
                      disabled={isLoading}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Continue with GitHub
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email/Phone Login for all users */}
                <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                  </TabsList>

                  <TabsContent value="email">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <LoadingFallback timeout={15000} message="Processing..." />
                        ) : (
                          <span className="ml-2">Login with Email</span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="phone">
                    <form onSubmit={handlePhoneLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+234XXXXXXXXXX"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-phone">Password</Label>
                        <Input
                          id="password-phone"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login with Phone"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {(isSuperAdminSubdomain || isAdminSubdomain) && (
                  <div className="text-center text-sm text-blue-600 mb-4 p-3 bg-blue-50 rounded-md">
                    Admin Registration - All fields including NIN are required
                  </div>
                )}

                <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                  </TabsList>

                  <TabsContent value="email">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name *</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      {(isSuperAdminSubdomain || isAdminSubdomain) && (
                        <div className="space-y-2">
                          <Label htmlFor="nin">NIN (Nigerian National ID) *</Label>
                          <Input
                            id="nin"
                            type="text"
                            placeholder="12345678901 (11 digits)"
                            required
                            maxLength={11}
                            value={nin}
                            onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                          />
                          <p className="text-xs text-gray-500">
                            Enter your 11-digit Nigerian National Identification Number
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email *</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="email@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password *</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="phone">
                    {!isSuperAdminSubdomain && !isAdminSubdomain && (
                      <form onSubmit={handlePhoneSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name-phone">Full Name</Label>
                          <Input
                            id="signup-name-phone"
                            type="text"
                            placeholder="Your full name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-phone">Phone Number</Label>
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+234XXXXXXXXXX"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password-phone">Password</Label>
                          <Input
                            id="signup-password-phone"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password-phone">Confirm Password</Label>
                          <Input
                            id="confirm-password-phone"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    )}
                    
                    {(isSuperAdminSubdomain || isAdminSubdomain) && (
                      <div className="text-center text-sm text-gray-600 p-4">
                        Admin registration requires email signup with NIN verification. Please use the Email tab above.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-600">
            <div className="w-full">
              <a href="/forgot-password" className="text-green-600 hover:underline">
                Forgot your password?
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
