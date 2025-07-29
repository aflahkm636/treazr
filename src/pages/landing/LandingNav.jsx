import { useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaClock } from 'react-icons/fa';

function LandingNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const baseLinkStyle =
    'inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-medium transition-all duration-300 ease-in-out rounded-full whitespace-nowrap cursor-pointer';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-4 overflow-x-auto hide-scrollbar py-4">
          <div
            onClick={() => navigate('/top-rated')}
            className={`${
              isActive('/top-rated')
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-200/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            } ${baseLinkStyle}`}
            aria-label="Top Rated Products"
          >
            <FaStar className="text-base" />
            Top Rated
          </div>

          <div
            onClick={() => navigate('/newest')}
            className={`${
              isActive('/newest')
                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md shadow-blue-200/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            } ${baseLinkStyle}`}
            aria-label="Newest Products"
          >
            <FaClock className="text-base" />
            Newest
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingNav;
