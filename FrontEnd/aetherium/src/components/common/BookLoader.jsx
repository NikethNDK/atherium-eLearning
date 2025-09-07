import React from 'react';

const BookLoader = ({ size = "large", message = "Loading..." }) => {
  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-24 h-32", 
    large: "w-32 h-40",
    xlarge: "w-40 h-48"
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
    xlarge: "text-lg"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Book Animation Container */}
      <div className="relative mb-8">
        {/* Book Outline */}
        <div className={`${sizeClasses[size]} relative`}>
          {/* Book Cover - Left Page */}
          <div className="absolute inset-0 border-2 border-blue-600 rounded-l-lg bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Book Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700"></div>
            
            {/* Page Lines */}
            <div className="absolute inset-2 space-y-1">
              <div className="h-0.5 bg-blue-300 rounded animate-pulse"></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.6s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.8s'}}></div>
            </div>
            
            {/* Study Icon */}
            <div className="absolute top-2 right-2">
              <div className="w-4 h-4 border-2 border-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Book Cover - Right Page */}
          <div className="absolute inset-0 border-2 border-blue-600 rounded-r-lg bg-gradient-to-br from-blue-50 to-blue-100 transform origin-left">
            {/* Page Lines */}
            <div className="absolute inset-2 space-y-1">
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.7s'}}></div>
              <div className="h-0.5 bg-blue-300 rounded animate-pulse" style={{animationDelay: '0.9s'}}></div>
            </div>
          </div>

          {/* Floating Study Elements */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 -left-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Page Turning Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-blue-600 rounded-r-lg bg-gradient-to-br from-blue-50 to-blue-100 transform origin-left animate-pulse opacity-50"></div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center">
        <h3 className={`font-semibold text-gray-700 mb-2 ${textSizeClasses[size]}`}>
          {message}
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes pageTurn {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-15deg); }
          100% { transform: rotateY(0deg); }
        }
        
        .book-page-turn {
          animation: pageTurn 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BookLoader;
