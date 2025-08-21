'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NotFound = () => {
  const [countdown, setCountdown] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAnimating(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div
        className={`max-w-lg mx-auto text-center relative z-10 transition-all duration-1000 transform ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* 404 Number with Animation */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-pulse">
            404
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 text-2xl animate-bounce">
            🌟
          </div>
          <div className="absolute -top-8 -right-8 text-3xl animate-bounce animation-delay-1000">
            ✨
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animation-delay-2000">
            💫
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-6xl mb-6 animate-bounce">🔍</div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h1>

          <p className="text-gray-600 text-lg mb-2">
            Sorry, the page you're looking for doesn't exist.
          </p>

          <p className="text-gray-500 text-sm mb-8">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleGoHome}
              className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">🏠</span>
                Go Home
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>

            <button
              onClick={handleGoBack}
              className="group px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-full font-semibold hover:border-purple-400 hover:text-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2">↩️</span>
              Go Back
            </button>
          </div>

          {/* Auto Redirect Counter */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">
              Automatically redirecting to home page in:
            </p>
            <div className="relative">
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-purple-200">
                  {countdown}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-purple-200"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
                  />
                  <path
                    className="text-purple-600 transition-all duration-1000 ease-out"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (10 - countdown) * 10}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Fun Suggestions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              While you're here, you might want to:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 cursor-pointer transition-colors">
                📚 Read Latest Posts
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 cursor-pointer transition-colors">
                🔍 Search Articles
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 cursor-pointer transition-colors">
                📝 Write a Post
              </span>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-gray-400 text-sm mt-6">
          Lost? Don't worry, even the best explorers sometimes take wrong turns!
          🗺️
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
