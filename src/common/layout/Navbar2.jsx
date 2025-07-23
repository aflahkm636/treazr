import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faHouse, faHeart, faBoxesStacked, faUser } from "@fortawesome/free-solid-svg-icons";
import { useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthProvider";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const FALLBACK_AVATAR = "src/assets/profile.png";

const AuthMenuItems = ({ isAuthenticated, logout }) => {
    const getMenuItemClass = useCallback(
        (focus) => classNames(focus ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700"),
        []
    );

    return isAuthenticated ? (
        <>
            <MenuItem>
                {({ focus }) => (
                    <NavLink to="/profile" className={getMenuItemClass(focus)}>
                        Your Profile
                    </NavLink>
                )}
            </MenuItem>
            <MenuItem>
                {({ focus }) => (
                    <button onClick={logout} className={classNames(getMenuItemClass(focus), "w-full text-left")}>
                        Sign out
                    </button>
                )}
            </MenuItem>
        </>
    ) : (
        <>
            <MenuItem>
                {({ focus }) => (
                    <NavLink to="/login" className={getMenuItemClass(focus)}>
                        Login
                    </NavLink>
                )}
            </MenuItem>
            <MenuItem>
                {({ focus }) => (
                    <NavLink to="/register" className={getMenuItemClass(focus)}>
                        Register
                    </NavLink>
                )}
            </MenuItem>
        </>
    );
};

const NavLinkItem = ({ item, cartCount }) => {
    const location = useLocation();
    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));

    return (
        <NavLink
            to={item.href}
            className={classNames(
                isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "px-3 py-2 rounded-md text-sm font-medium flex items-center relative transition-colors duration-200"
            )}
        >
            <FontAwesomeIcon icon={item.icon} className="mr-2" />
            {item.name}
            {item.name === "Cart" && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                </span>
            )}
        </NavLink>
    );
};

export default function NavBar() {
    const { user, isAuthenticated, logout, cartCount } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = useMemo(
        () => [
            { name: "Home", href: "/", icon: faHouse },
            { name: "Products", href: "/products", icon: faBoxesStacked },
            ...(isAuthenticated ? [{ name: "Wishlist", href: "/wishlist", icon: faHeart }] : []),
            { name: "Cart", href: "/cart", icon: faCartShopping },
        ],
        [isAuthenticated]
    );

    const handleLoginClick = () => {
        navigate("/login");
    };

    return (
        <Disclosure as="nav" className="fixed top-0 w-full z-50 bg-gray-800 shadow-lg">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Left side - Logo and Nav */}
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-white font-bold text-xl">Treazr</span>
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-1">
                                        {navigation.map((item) => (
                                            <NavLinkItem
                                                key={item.name}
                                                item={item}
                                                cartCount={item.name === "Cart" ? cartCount : 0}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Profile or Login */}
                            <div className="flex items-center">
                                {isAuthenticated ? (
                                    <>
                                        <div className="hidden sm:block mr-4">
                                            <span className="text-white text-sm font-medium">{user?.name}</span>
                                        </div>

                                        {/* Profile dropdown */}
                                        <Menu as="div" className="relative">
                                            <MenuButton className="flex rounded-full text-sm focus:outline-none">
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={user?.avatar || FALLBACK_AVATAR}
                                                    alt="User profile"
                                                    width={32}
                                                    height={32}
                                                />
                                            </MenuButton>
                                            <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <AuthMenuItems isAuthenticated={isAuthenticated} logout={logout} />
                                            </MenuItems>
                                        </Menu>
                                    </>
                                ) : (
                                    <>
                                        {/* Login button - desktop */}
                                        <button
                                            onClick={handleLoginClick}
                                            className="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.12) 100%)",
                                                color: "#4f46e5", // Indigo-600
                                                border: "1px solid rgba(99,102,241,0.2)",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="mr-2" style={{ color: "#a5b4fc" }} />
                                            Login
                                        </button>
                                    </>
                                )}

                                {/* Mobile menu button */}
                                <div className="sm:hidden ml-4">
                                    <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-white focus:outline-none">
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" />
                                        )}
                                    </DisclosureButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <DisclosurePanel className="sm:hidden bg-gray-800">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    as={NavLink}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        classNames(
                                            isActive
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "block px-3 py-2 rounded-md text-base font-medium flex items-center relative"
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={item.icon} className="mr-2" />
                                    {item.name}
                                    {item.name === "Cart" && cartCount > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </DisclosureButton>
                            ))}
                            {isAuthenticated ? (
                                <div className="pt-4 pb-2 border-t border-gray-700">
                                    <div className="flex items-center px-4">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={user?.avatar || FALLBACK_AVATAR}
                                            alt="User profile"
                                        />
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">{user?.name}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <DisclosureButton
                                            as={NavLink}
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Your Profile
                                        </DisclosureButton>
                                        <DisclosureButton
                                            as="button"
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Sign out
                                        </DisclosureButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-gray-700">
                                    <DisclosureButton
                                        as={NavLink}
                                        to="/login"
                                        className="block px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.2) 100%)",
                                            border: "1px solid rgba(99,102,241,0.3)",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Login
                                    </DisclosureButton>
                                    <DisclosureButton
                                        as={NavLink}
                                        to="/register"
                                        className="block px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.2) 100%)",
                                            border: "1px solid rgba(99,102,241,0.3)",
                                        }}
                                    >
                                        Register
                                    </DisclosureButton>
                                </div>
                            )}
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}
