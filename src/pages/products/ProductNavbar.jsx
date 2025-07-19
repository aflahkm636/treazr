import { NavLink } from "react-router-dom";

const ProductNavbar = () => {
  const navItems = [
    { path: "/products/all", label: "All" },
    { path: "/products/diecast-cars", label: "Diecast-Cars" },
    { path: "/products/action-figures", label: "Action-Figures" },
    { path: "/products/comics", label: "Comics" },
    { path: "/products/TradingCards", label: "Trading-Cards" },
  ];

  return (
    <nav className="bg-white shadow-sm p-4 mt-15">
      <div className="container mx-auto">
        <ul className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ProductNavbar;
