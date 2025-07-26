import { useSeoMeta } from "@unhead/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  ArrowLeft, 
  Zap,
  Rocket,
  Stars,
  Globe,
  RefreshCw
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useSeoMeta({
    title: "404 - Page Not Found | Angor Hub",
    description: "The page you are looking for could not be found. Explore our Bitcoin crowdfunding platform and discover exciting projects.",
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Trigger animation on load
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute top-10 left-10 text-primary/10 animate-bounce">
          <Rocket className="w-8 h-8" />
        </div>
        <div className="absolute top-20 right-20 text-primary/10 animate-pulse">
          <Stars className="w-6 h-6" />
        </div>
        <div className="absolute bottom-20 left-20 text-primary/10 animate-bounce [animation-delay:1s]">
          <Globe className="w-7 h-7" />
        </div>
        <div className="absolute bottom-10 right-10 text-primary/10 animate-pulse [animation-delay:2s]">
          <Zap className="w-5 h-5" />
        </div>
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-small opacity-5" />
      </div>

      <div className={`max-w-2xl w-full text-center space-y-8 transform transition-all duration-1000 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        
        {/* 404 Number with Animation */}
        <div className="relative">
          <div className="text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-primary/70 animate-pulse">
            404
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            
            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Oops! Lost in Space
              </h1>
              <div className="space-y-2">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The page you're looking for has drifted away into the Bitcoin cosmos.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't worry, even the best explorers get lost sometimes!
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span className="font-mono break-all">
                  {window.location.origin}<span className="text-destructive">{location.pathname}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Button 
                onClick={handleGoHome}
                className="h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={handleRefresh}
                className="h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Lost but not forgotten in the decentralized universe</p>
          <p className="flex items-center justify-center gap-1">
            Made with <span className="text-red-500 animate-pulse">♥</span> by Angor Hub
          </p>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
