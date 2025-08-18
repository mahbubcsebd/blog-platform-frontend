// // components/DebugAuth.js
// 'use client';

// import { refreshTokenAction } from '@/actions/auth';
// import { useAuth } from '@/hooks/useAuth';

// export default function DebugAuth() {
//   const { user, accessToken, loading, isAuthenticated, tokenExpiry } =
//     useAuth();

//   const handleRefreshTest = async () => {
//     console.log('Testing refresh token...');
//     const result = await refreshTokenAction();
//     console.log('Refresh result:', result);
//   };

//   const handleCookieTest = () => {
//     console.log('Checking cookies...');
//     // This won't work in client-side, but we can see what's available
//     console.log('Document cookies:', document.cookie);
//   };

//   if (process.env.NODE_ENV !== 'development') {
//     return null; // Only show in development
//   }

//   return (
//     <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
//       <h3 className="font-bold mb-2">Auth Debug Info:</h3>
//       <div className="space-y-1">
//         <p>Loading: {loading ? 'Yes' : 'No'}</p>
//         <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
//         <p>User: {user ? `${user.firstName} ${user.lastName}` : 'None'}</p>
//         <p>Access Token: {accessToken ? 'Yes' : 'No'}</p>
//         <p>
//           Token Expiry:{' '}
//           {tokenExpiry ? new Date(tokenExpiry).toLocaleTimeString() : 'None'}
//         </p>
//       </div>
//       <div className="mt-3 space-x-2">
//         <button
//           onClick={handleRefreshTest}
//           className="bg-blue-600 px-2 py-1 rounded text-xs"
//         >
//           Test Refresh
//         </button>
//         <button
//           onClick={handleCookieTest}
//           className="bg-green-600 px-2 py-1 rounded text-xs"
//         >
//           Check Cookies
//         </button>
//       </div>
//     </div>
//   );
// }
