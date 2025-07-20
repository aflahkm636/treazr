import { NavLink } from "react-router-dom";

const ProductNavbar = () => {
  const navItems = [
    { path: "/products/all", label: "All" },
    { path: "/products/diecast-cars", label: "Diecast Cars" },
    { path: "/products/action-figures", label: "Action Figures" },
    { path: "/products/comics", label: "Comics" },
    { path: "/products/TradingCards", label: "Trading Cards" },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 w-full py-4 mt-15">
      <div className="flex justify-center mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center w-full">
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `inline-flex items-center px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out rounded-full whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 border border-transparent hover:border-gray-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ProductNavbar;