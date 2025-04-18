
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ServerError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <AlertCircle className="h-20 w-20 text-red-500 mb-4" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-white text-2xl">
              500
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Server Error</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong on our servers. We're working on fixing the issue and appreciate your patience.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-800 text-sm font-medium">
              Technical details: An unexpected error occurred while processing your request.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Try Again
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

export default ServerError;
