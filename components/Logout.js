// 'use client';

// import { logoutUser } from '@/actions/auth';
// import { Button } from '@/components/ui/button';
// import { Loader2, LogOut } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// // Simple logout button component
// export function LogoutButton({
//   className = '',
//   variant = 'outline',
//   size = 'default',
// }) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogout = async () => {
//     try {
//       setIsLoading(true);
//       const result = await logoutUser();

//       if (result.success) {
//         // Redirect to home page
//         router.push('/');
//         router.refresh(); // Refresh to clear any cached data
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Button
//       onClick={handleLogout}
//       disabled={isLoading}
//       variant={variant}
//       size={size}
//       className={className}
//     >
//       {isLoading ? (
//         <>
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Signing out...
//         </>
//       ) : (
//         <>
//           <LogOut className="mr-2 h-4 w-4" />
//           Sign out
//         </>
//       )}
//     </Button>
//   );
// }

// // Custom hook for logout functionality
// export function useLogout() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const logout = async () => {
//     try {
//       setIsLoading(true);
//       const result = await logoutUser();

//       if (result.success) {
//         router.push('/');
//         router.refresh();
//         return { success: true };
//       } else {
//         return { success: false, error: result.error };
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//       return { success: false, error: 'Logout failed' };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return { logout, isLoading };
// }

// // Dropdown menu item for logout (if using dropdown)
// export function LogoutMenuItem({ onClose }) {
//   const { logout, isLoading } = useLogout();

//   const handleLogout = async () => {
//     await logout();
//     onClose?.();
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       disabled={isLoading}
//       className="flex w-full items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//     >
//       {isLoading ? (
//         <>
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Signing out...
//         </>
//       ) : (
//         <>
//           <LogOut className="mr-2 h-4 w-4" />
//           Sign out
//         </>
//       )}
//     </button>
//   );
// }
