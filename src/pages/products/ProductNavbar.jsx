import { useSearch } from "./Products";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaCarSide,
  FaChessKnight,
  FaBookOpen,
  FaThLarge,
  FaLayerGroup,
} from "react-icons/fa";

const ProductNavbar = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/products/all", label: "All", icon: <FaThLarge /> },
    { path: "/products/diecast-cars", label: "Diecast Cars", icon: <FaCarSide /> },
    { path: "/products/action-figures", label: "Action Figures", icon: <FaChessKnight /> },
    { path: "/products/comics", label: "Comics", icon: <FaBookOpen /> },
    { path: "/products/TradingCards", label: "Trading Cards", icon: <FaLayerGroup /> },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-md w-full z-30 mt-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Search Input */}
          <div className="flex-1 mx-4 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search our collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Invisible placeholder for spacing */}
          <div className="w-8" />
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="mt-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
            <div className="divide-y divide-gray-100">
              {navItems.map(({ path, label, icon }) => {
                const isActive = location.pathname === path;
                return (
                  <div
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-all ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-semibold border-l-4 border-indigo-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-base text-indigo-500">{icon}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ProductNavbar;
