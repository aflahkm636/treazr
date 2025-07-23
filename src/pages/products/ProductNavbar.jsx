import { NavLink } from "react-router-dom";
import { useSearch } from "./Products";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const ProductNavbar = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/products/all", label: "All" },
    { path: "/products/diecast-cars", label: "Diecast Cars" },
    { path: "/products/action-figures", label: "Action Figures" },
    { path: "/products/comics", label: "Comics" },
    { path: "/products/TradingCards", label: "Trading Cards" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 w-full py-3 mt-15 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-10">
          {/* Hamburger Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 mx-4 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search our collection..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>
          </div>

          {/* Placeholder for icons */}
          <div className="w-8"></div>
        </div>

        {/* Luxury Dropdown Menu */}
        {isMenuOpen && (
          <div className="mt-3 pb-2 bg-white rounded-lg shadow-xl border border-gray-300/50 overflow-hidden">
            <div className="space-y-0.5">
              {navItems.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gray-100 text-gray-900 border-l-4 border-gray-900 font-medium"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/70"
                    }`
                  }
                >
                  <span className="flex items-center">
                    <span className="ml-1">{label}</span>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ProductNavbar;