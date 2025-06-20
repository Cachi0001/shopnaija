import { useEffect, useState } from "react";
import { CheckCircle, Users, ShoppingBag, TrendingUp, Star, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const LandingPage = () => {
  // Debug: Log when component mounts
  console.log('[LandingPage] Component mounted');
  try {
    const { toast } = useToast();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [renderError, setRenderError] = useState<string | null>(null);

    // Debug: Log online status changes
    useEffect(() => {
      console.log('[LandingPage] Online status:', isOnline);
    }, [isOnline]);

    // Check network status
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    // Auto-refresh functionality with network check
    useEffect(() => {
      if (!isOnline) return;

      const refreshTimeout = setTimeout(() => {
        window.location.reload();
      }, 60000); // Increased to 60 seconds

      const handleActivity = () => {
        clearTimeout(refreshTimeout);
      };

      const events = ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        clearTimeout(refreshTimeout);
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }, [isOnline]);

    // Show offline indicator
    if (!isOnline) {
      console.log('[LandingPage] Offline detected');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
            <p className="text-gray-600 mb-6">
              Please check your internet connection and try again.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    // If a render error occurred, show it
    if (renderError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Page</h1>
            <p className="text-gray-600 mb-6">{renderError}</p>
            <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
              Reload
            </Button>
          </div>
        </div>
      );
    }

    const handleGetStarted = () => {
      const whatsappMessage = encodeURIComponent(
        "Hello! I want to register as an admin on growsmallbeez. I'm interested in the ₦60,000 annual plan with the 20% discount. Please help me set up my store with the following details: Name, Phone, Email, NIN, Account Name, Account Number, Bank Name, Website Name, and Subdomain."
      );
      window.open(`https://wa.me/+2348158025887?text=${whatsappMessage}`, '_blank');
    };

    const handleFooterClick = (section: string, item: string) => {
      let message = "";
      
      switch (item) {
        case "Features":
          message = "Growsmallbeez offers beautiful online stores, sales analytics, and customer management tools to help Nigerian entrepreneurs succeed online.";
          break;
        case "Pricing":
          message = "Growsmallbeez costs ₦60,000 annually but we're offering a 20% discount! Contact us on WhatsApp at +2348158025887 to get this special offer.";
          break;
        case "Templates":
          message = "Choose from beautiful, mobile-responsive store templates designed specifically for Nigerian businesses.";
          break;
        case "Help Center":
          message = "Need help? Contact us on WhatsApp at +2348158025887 for instant support and guidance.";
          break;
        case "Contact Us":
          message = "Reach out to us on WhatsApp: +2348158025887 or follow us on X @Caleb0533 for updates and support.";
          break;
        case "Documentation":
          message = "Complete guides and tutorials are available to help you set up and manage your online store successfully.";
          break;
        case "About":
          message = "Growsmallbeez empowers Nigerian entrepreneurs to build successful online businesses with our all-in-one e-commerce platform.";
          break;
        case "Privacy Policy":
          message = "We protect your data and privacy. Your information is secure and never shared with third parties without your consent.";
          break;
        case "Terms of Service":
          message = "Our terms ensure fair usage and protection for all users. We're committed to transparency and ethical business practices.";
          break;
        default:
          message = "This feature is coming soon! Follow us on X @Caleb0533 for updates.";
      }

      toast({
        title: item,
        description: message,
        duration: 5000,
      });
    };

    const features = [
      {
        icon: ShoppingBag,
        title: "Beautiful Online Stores",
        description: "Create stunning, mobile-responsive stores that convert visitors into customers."
      },
      {
        icon: TrendingUp,
        title: "Sales Analytics",
        description: "Track your performance with detailed analytics and insights to grow your business."
      },
      {
        icon: Users,
        title: "Customer Management",
        description: "Manage customer relationships and build a loyal customer base effortlessly."
      }
    ];

    const testimonials = [
      {
        name: "Adaora Okonkwo",
        business: "Fashion Boutique",
        content: "Growsmallbeez transformed my fashion business. Sales increased by 300% in just 3 months!",
        rating: 5
      },
      {
        name: "Ibrahim Musa",
        business: "Electronics Store",
        content: "The platform is so easy to use. I set up my electronics store in minutes and started selling immediately.",
        rating: 4.5
      },
      {
        name: "Chioma Nwankwo",
        business: "Beauty Products",
        content: "Customer management tools are amazing. I can track orders and communicate with customers seamlessly.",
        rating: 4.5
      }
    ];

    // Defensive: ensure features is always an array
    const safeFeatures = Array.isArray(features) ? features : [];
    // Defensive: ensure testimonials is always an array
    const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-white py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Grow Your 
                <span className="block text-green-600">Small Business</span>
                <span className="block">Online with Growsmallbeez</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                The all-in-one platform for Nigerian entrepreneurs to create beautiful online stores, 
                manage customers, and grow their business with powerful tools designed for success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  style={{ backgroundColor: '#00A862' }}
                >
                  Start Your Store Today
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-gray-400 line-through text-sm">₦75,000/year</span>
                    <span className="text-2xl font-bold text-green-600">₦60,000/year</span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">20% OFF!</span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold">
                    Special 20% Discount • Limited Time • 24/7 support
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact us on WhatsApp for this exclusive pricing!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Powerful features designed specifically for Nigerian small businesses
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {safeFeatures.map((feature, index) => (
                <div key={index} className="text-center p-6 sm:p-8 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                  <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 sm:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Special Discount Pricing
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-4 border-green-600 relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold animate-pulse">
                  🎯 20% DISCOUNT ACTIVE!
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Annual Plan</h3>
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl text-gray-400 line-through">₦75,000</span>
                    <span className="text-4xl sm:text-5xl font-bold text-green-600">₦60,000</span>
                  </div>
                  <span className="text-gray-600">/year</span>
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Save ₦15,000 with 20% Discount!
                    </span>
                  </div>
                </div>
                <ul className="text-left space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-center text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Custom subdomain (yourstore.growsmallbeez.com)</span>
                  </li>
                  <li className="flex items-center text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Unlimited products</span>
                  </li>
                  <li className="flex items-center text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>PayStack payment integration</span>
                  </li>
                  <li className="flex items-center text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>WhatsApp order notifications</span>
                  </li>
                  <li className="flex items-center text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full text-white font-semibold text-base sm:text-lg py-3 sm:py-4"
                  style={{ backgroundColor: '#00A862' }}
                >
                  Get 20% Discount Now - Only ₦60,000/year!
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-20 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 px-4">
                Join thousands of successful Nigerian entrepreneurs
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {safeTestimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex mb-4">
                    {Array(
                      Number.isFinite(testimonial.rating) && testimonial.rating > 0 ? Math.floor(testimonial.rating) : 0
                    ).fill(null).map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic text-sm sm:text-base">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.business}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 bg-green-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Start Your Online Business?
            </h2>
            <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 px-4">
              Join thousands of Nigerian entrepreneurs who trust Growsmallbeez to power their online success.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get 20% Discount Now - Only ₦60,000/year!
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-4">Growsmallbeez</h3>
                <p className="text-gray-300 text-sm sm:text-base">
                  Empowering Nigerian entrepreneurs to build successful online businesses.
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">www.growsmallbeez.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm sm:text-base">Product</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><button onClick={() => handleFooterClick('Product', 'Features')} className="hover:text-green-400 text-left text-xs sm:text-sm">Features</button></li>
                  <li><button onClick={() => handleFooterClick('Product', 'Pricing')} className="hover:text-green-400 text-left text-xs sm:text-sm">Pricing</button></li>
                  <li><button onClick={() => handleFooterClick('Product', 'Templates')} className="hover:text-green-400 text-left text-xs sm:text-sm">Templates</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm sm:text-base">Support</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><button onClick={() => handleFooterClick('Support', 'Help Center')} className="hover:text-green-400 text-left text-xs sm:text-sm">Help Center</button></li>
                  <li><button onClick={() => handleFooterClick('Support', 'Contact Us')} className="hover:text-green-400 text-left text-xs sm:text-sm">Contact Us</button></li>
                  <li><button onClick={() => handleFooterClick('Support', 'Documentation')} className="hover:text-green-400 text-left text-xs sm:text-sm">Documentation</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm sm:text-base">Company</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><button onClick={() => handleFooterClick('Company', 'About')} className="hover:text-green-400 text-left text-xs sm:text-sm">About</button></li>
                  <li><button onClick={() => handleFooterClick('Company', 'Privacy Policy')} className="hover:text-green-400 text-left text-xs sm:text-sm">Privacy Policy</button></li>
                  <li><button onClick={() => handleFooterClick('Company', 'Terms of Service')} className="hover:text-green-400 text-left text-xs sm:text-sm">Terms of Service</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
              <p className="text-xs sm:text-sm">© 2024 Growsmallbeez. All rights reserved. Made with ❤️ for Nigerian entrepreneurs.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    console.error('[LandingPage] Error during render:', err);
    // Show a visible error message instead of throwing
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Page</h1>
          <p className="text-gray-600 mb-6">{err instanceof Error ? err.message : String(err)}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Reload
          </Button>
        </div>
      </div>
    );
  }
};

export default LandingPage;
