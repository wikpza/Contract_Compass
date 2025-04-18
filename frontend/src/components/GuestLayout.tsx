
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with logo */}
      <header className="bg-white border-b border-gray-200 py-3 md:py-4 sticky top-0 z-10">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-business-600 mr-1 md:mr-2" />
            <span className="text-base md:text-lg font-bold text-business-800 truncate">Contract Compass</span>
            <div className="ml-auto bg-gray-100 text-gray-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap">
              Guest View
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {children}
      </main>
      
      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200 py-3 md:py-4 mt-auto">
        <div className="container mx-auto px-3 md:px-4 text-center text-xs md:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Contract Compass. View-only mode.</p>
        </div>
      </footer>
    </div>
  );
};

export default GuestLayout;
