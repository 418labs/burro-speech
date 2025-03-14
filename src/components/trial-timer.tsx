
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export function TrialTimer({ 
  duration = 60, 
  onExpire 
}: { 
  duration: number; 
  onExpire: () => void; 
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onExpire, duration]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  
  return (
    <Badge 
      variant="outline" 
      className="fixed top-4 right-4 py-1 px-3 bg-white/90 dark:bg-gray-800/90 shadow-md z-50"
    >
      <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
      <span>Free trial: <span className="font-mono">{formatTime(timeLeft)}</span></span>
    </Badge>
  );
}