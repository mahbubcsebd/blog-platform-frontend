'use client';
import Link from 'next/link';
// import { useLogout } from './Logout';

const Header = () => {
  // const { logout, isLoading } = useLogout();
  return (
    <div className="header" id="header">
      <div className="bg-gray-100 py-5 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex justify-between itesms-center gap-5">
            <div className="header-logo">
              <Link href="/" className="text-black font-bold text-lg">
                Blog
              </Link>
            </div>
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  href="/posts"
                  className="text-base font-semibold text-gray-900"
                >
                  All blog
                </Link>
              </li>
              <li>
                <Link
                  href="/posts/create"
                  className="text-base font-semibold text-gray-900"
                >
                  Create Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/posts/edit/blog-slug"
                  className="text-base font-semibold text-gray-900"
                >
                  Edit Blog
                </Link>
              </li>
            </ul>
            <ul className="flex items-center gap-4">
              <li>
                <Link
                  href="/sign-in"
                  className="text-base font-semibold text-gray-900"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-base font-semibold text-gray-900"
                >
                  Sign Up
                </Link>
              </li>
              {/* <li>
                <button onClick={logout} disabled={isLoading}>
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </button>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
