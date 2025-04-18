
import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const UnableToLoadData = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <FileWarning className="h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Unable to Load Data</h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the requested data. This might be due to a
            connection issue or temporary server problem.
          </p>
          
          <Alert variant="destructive" className="mb-6 text-left">
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              The server responded with an error while fetching the requested information.
            </AlertDescription>
          </Alert>

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

export default UnableToLoadData;
