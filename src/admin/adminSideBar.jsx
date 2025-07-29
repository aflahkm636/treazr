// src/components/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../common/context/AuthProvider";
import { FiMenu, FiX, FiHome, FiUsers, FiShoppingBag, FiPackage, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../common/context/Darkthemeprovider";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleTheme, darkMode } = useTheme(); // ← new

    const toggleMobileSidebar = () => {
        setMobileOpen(!mobileOpen);
    };

    const navigateTo = (path) => {
        navigate(`/admin/${path}`);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            {/* Mobile menu button - shows below 1200px */}
            <button
                onClick={toggleMobileSidebar}
                className="xl:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
            >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay for mobile - shows below 1200px */}
            {mobileOpen && (
                <div className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileSidebar} />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 z-40 shadow-lg transition-all duration-300
  ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"}
  ${mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Admin profile */}
                    {user && (
                        <div className="flex flex-col items-center mb-8 p-4 border-b">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold mb-2">
                                {user.name.charAt(0)}
                            </div>
                            <h3 className="font-medium text-gray-800">{user.name}</h3>
                            <p className="text-sm text-gray-500 truncate w-full text-center">{user.email}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1">
                        <ul className="space-y-2">
                            <li>
                                {/* Dashboard */}
                                <button
                                    onClick={() => navigateTo("")}
                                    className={`flex items-center w-full p-3 rounded-lg transition-colors justify-start
        ${location.pathname === "/admin/" ? "bg-indigo-100 text-indigo-700" : "hover:bg-indigo-50 hover:text-indigo-600"}`}
                                >
                                    <FiHome size={20} />
                                    <span className="ml-3">Dashboard</span>
                                </button>
                            </li>
                            <li>
                                {/* Manage Users */}
                                <button
                                    onClick={() => navigateTo("users")}
                                    className={`flex items-center w-full p-3 rounded-lg transition-colors justify-start
        ${
            location.pathname === "/admin/users"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-indigo-50 hover:text-indigo-600"
        }`}
                                >
                                    <FiUsers size={20} />
                                    <span className="ml-3">Manage Users</span>
                                </button>
                            </li>
                            <li>
                                {/* Manage Products */}
                                <button
                                    onClick={() => navigateTo("products")}
                                    className={`flex items-center w-full p-3 rounded-lg transition-colors justify-start
        ${
            location.pathname === "/admin/products"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-indigo-50 hover:text-indigo-600"
        }`}
                                >
                                    <FiShoppingBag size={20} />
                                    <span className="ml-3">Manage Products</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigateTo("orders")}
                                    className={`flex items-center w-full p-3 rounded-lg transition-colors justify-start
        ${
            location.pathname === "/admin/orders"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-indigo-50 hover:text-indigo-600"
        }
    `}
                                >
                                    <FiPackage size={20} />
                                    <span className="ml-3">Manage Orders</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center p-3 rounded-lg mt-4 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors justify-start"
                                >
                                    {darkMode ? (
                                        <>
                                            <FiSun className="mr-2" />
                                            <span>Light Mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiMoon className="mr-2" />
                                            <span>Dark Mode</span>
                                        </>
                                    )}
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors justify-start"
                    >
                        <FiLogOut size={20} />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
