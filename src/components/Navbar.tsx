
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGetStarted = () => {
    const whatsappMessage = encodeURIComponent(
      "Hello! I want to register as an admin on GrowSmallBeez. I'm interested in the ₦60,000 annual plan with the 20% discount. Please help me set up my store with the following details: Name, Phone, Email, NIN, Account Name, Account Number, Bank Name, Website Name, and Subdomain."
    );
    window.open(`https://wa.me/+2348158025887?text=${whatsappMessage}`, '_blank');
  };

  const handleFollowTwitter = () => {
    window.open('https://x.com/Caleb0533', '_blank');
  };

  const handleDiscountInfo = () => {
    toast({
      title: "🎉 Special Discount - 20% OFF!",
      description: "Get 20% off your annual subscription! This exclusive offer brings your cost down to ₦60,000/year (was ₦75,000). Contact us on WhatsApp to claim this limited-time discount and save ₦15,000!",
      duration: 8000,
    });
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold" style={{ color: '#00A862' }}>
              GrowSmallBeez
            </h1>
            <p className="text-xs text-gray-500">www.growsmallbeez.com</p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 lg:space-x-8">
              <button 
                onClick={handleFollowTwitter}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Twitter size={16} />
                Follow us on X
              </button>
              
              {/* 20% Discount Link - Visible to all users */}
              <button 
                onClick={handleDiscountInfo}
                className="text-white hover:text-yellow-200 px-3 py-2 text-sm font-bold transition-colors flex items-center gap-1 whitespace-nowrap bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md animate-pulse hover:animate-none"
              >
                🎯 20% Discount!
              </button>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <LoginModal>
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
              >
                Login
              </Button>
            </LoginModal>
            <Button 
              onClick={handleGetStarted}
              className="text-white px-3 sm:px-6 py-2 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm whitespace-nowrap"
              style={{ backgroundColor: '#00A862' }}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button 
                onClick={handleFollowTwitter}
                className="text-gray-700 hover:text-green-600 block px-3 py-2 text-base font-medium flex items-center gap-2 w-full text-left"
              >
                <Twitter size={16} />
                Follow us on X
              </button>
              
              {/* 20% Discount Link - Mobile - Visible to all users */}
              <button 
                onClick={handleDiscountInfo}
                className="text-white hover:text-yellow-200 block px-3 py-2 text-base font-bold flex items-center gap-2 w-full text-left bg-gradient-to-r from-red-500 to-red-600 rounded-lg mx-3 animate-pulse"
              >
                🎯 20% Discount!
              </button>
              
              <div className="px-3 py-2 space-y-3">
                <LoginModal>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 text-sm"
                  >
                    Login
                  </Button>
                </LoginModal>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                  style={{ backgroundColor: '#00A862' }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
