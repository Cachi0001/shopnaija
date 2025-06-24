import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingFallbackProps {
  message?: string;
  timeout?: number;
  timeoutReached?: boolean;
}

const LoadingFallback = () => {
  // Render nothing at all
  return null;
};

export default LoadingFallback;
