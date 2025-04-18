
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Search className="h-16 w-16 text-business-500 mb-4" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              404
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left w-full">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Looking for:</span> {location.pathname}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
