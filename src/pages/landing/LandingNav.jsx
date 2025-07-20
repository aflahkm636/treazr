import { NavLink } from 'react-router-dom';

function LandingNav() {
  const baseLinkStyle =
    'inline-flex items-center px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-medium transition-all duration-300 ease-in-out rounded-full whitespace-nowrap';

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 py-4 w-full">
      <div className="flex justify-center mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex space-x-2 sm:space-x-6 overflow-x-auto py-1 hide-scrollbar">
          <NavLink
            to="/top-rated"
            className={({ isActive }) =>
              isActive
                ? `bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200/50 ${baseLinkStyle}`
                : `text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 ${baseLinkStyle}`
            }
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Top Rated
          </NavLink>
          <NavLink
            to="/newest"
            className={({ isActive }) =>
              isActive
                ? `bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-200/50 ${baseLinkStyle}`
                : `text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 ${baseLinkStyle}`
            }
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Newest
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default LandingNav;