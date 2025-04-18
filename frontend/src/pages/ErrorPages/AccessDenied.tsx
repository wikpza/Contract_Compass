
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Sorry, you don't have permission to access this page or resource.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-800 text-sm">
              Error 403: You lack sufficient permissions for the requested action. If you believe this is a mistake, please contact your administrator.
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

export default AccessDenied;
