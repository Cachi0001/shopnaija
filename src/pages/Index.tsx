
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-brand-800">GrowSmallBeez</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          A powerful multi-admin e-commerce platform where each admin gets their own custom storefront with independent data, payments, and branding.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="bg-brand-800 hover:bg-brand-700 w-full sm:w-auto">
              Login
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="bg-brand-100 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Multi-Tenant Architecture</h3>
          <p className="text-gray-600">Each admin gets their own subdomain with custom branding and independent data.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="bg-brand-100 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Integrated Payments</h3>
          <p className="text-gray-600">Secure payment processing with automatic disbursements to admin accounts.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="bg-brand-100 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Customizable Stores</h3>
          <p className="text-gray-600">Admins can fully customize their store's appearance and branding elements.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="bg-brand-100 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
          <p className="text-gray-600">Comprehensive reporting and insights for both admins and superadmins.</p>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          © 2025 MultiStore Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
