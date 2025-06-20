
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingFallbackProps {
  message?: string;
  timeout?: number;
}

const LoadingFallback = ({ message = "Loading ShopNaija...", timeout = 8000 }: LoadingFallbackProps) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Issue</h1>
            <p className="text-gray-600 mb-4">
              GrowSmallBeez is taking longer than expected to load. Please try refreshing the page.
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
