import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingFallbackProps {
  message?: string;
  timeout?: number;
  timeoutReached?: boolean;
}

const LoadingFallback = ({ message = "Loading ShopNaija...", timeout = 8000, timeoutReached = false }: LoadingFallbackProps) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (timeoutReached) {
      setShowTimeout(true);
    } else {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);

      // Clean up the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [timeout, timeoutReached]);

  // Always show the loader and loading message, never show timeout fallback
  return (
    // <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    //   <div className="text-center">
    //     <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
    //     <p className="text-gray-600 text-lg">{message}</p>
    //     <p className="text-gray-400 text-sm mt-2">Please wait...</p>
    //   </div>
    // </div>
    <div></div>
  );
};

export default LoadingFallback;
