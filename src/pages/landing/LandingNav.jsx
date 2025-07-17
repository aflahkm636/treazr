import { NavLink } from 'react-router-dom';

function LandingNav() {
  const baseLinkStyle =
    'block px-4 py-1 rounded-md text-sm font-medium transition duration-300';

  return (
    <nav className="bg-white shadow-sm py-2 px-6">
      <div className="flex justify-center">
        <ul className="flex items-center space-x-4">
          <li>
            <NavLink
              to="/top-rated"
              className={({ isActive }) =>
                isActive
                  ? `bg-emerald-100 text-emerald-700 border border-emerald-400 ${baseLinkStyle}`
                  : `text-gray-700 hover:bg-gray-100 border border-transparent ${baseLinkStyle}`
              }
            >
              Top Rated
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/newest"
              className={({ isActive }) =>
                isActive
                  ? `bg-emerald-100 text-emerald-700 border border-emerald-400 ${baseLinkStyle}`
                  : `text-gray-700 hover:bg-gray-100 border border-transparent ${baseLinkStyle}`
              }
            >
              Newest
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default LandingNav;
