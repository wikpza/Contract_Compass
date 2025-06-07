import React from 'react';
import { Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingPageProps {
    message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
                                                     message = "Loading data, please wait..."
                                                 }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md flex flex-col items-center text-center">
                <div className="animate-spin mb-4">
                    <Loader className="h-16 w-16 text-primary" />
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-800">Loading</h1>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="w-full mb-6">
                    <Progress
                        value={66}
                        className="h-2"
                        indicatorClassName="bg-primary"
                    />
                </div>

                <div className="w-full space-y-3">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                    <Skeleton className="h-[100px] w-full" />
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;