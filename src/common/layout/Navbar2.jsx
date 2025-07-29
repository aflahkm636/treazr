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
        (focus) => classNames(
            focus ? "bg-indigo-50" : "",
            "block px-4 py-2 text-sm text-gray-700 transition-colors duration-150"
        ),
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
                    <button 
                        onClick={logout} 
                        className={classNames(
                            getMenuItemClass(focus), 
                            "w-full text-left text-rose-600 hover:text-rose-700"
                        )}
                    >
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
    const isActive = location.pathname === item.href || 
                    (item.href !== "/" && location.pathname.startsWith(item.href));

    return (
        <NavLink
            to={item.href}
            className={classNames(
                isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "px-3 py-2 rounded-md text-sm font-medium flex items-center relative transition-all duration-200 group"
            )}
        >
            <FontAwesomeIcon 
                icon={item.icon} 
                className={classNames(
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                    "mr-2 transition-colors duration-200"
                )} 
            />
            {item.name}
            {item.name === "Cart" && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
                                    <span className="text-white font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                        Treazr
                                    </span>
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
                                            <span className="text-gray-200 text-sm font-medium">
                                                Hi, {user?.name.split(' ')[0]}
                                            </span>
                                        </div>

                                        {/* Profile dropdown */}
                                        <Menu as="div" className="relative">
                                            <MenuButton className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                                                <img
                                                    className="h-8 w-8 rounded-full border-2 border-indigo-400 hover:border-indigo-300 transition-colors duration-200"
                                                    src={user?.avatar || FALLBACK_AVATAR}
                                                    alt="User profile"
                                                    width={32}
                                                    height={32}
                                                />
                                            </MenuButton>
                                            <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                                <AuthMenuItems isAuthenticated={isAuthenticated} logout={logout} />
                                            </MenuItems>
                                        </Menu>
                                    </>
                                ) : (
                                    <>
                                        {/* Login button - desktop */}
                                        <button
                                            onClick={handleLoginClick}
                                            className="hidden sm:flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-md hover:shadow-lg"
                                        >
                                            <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-100" />
                                            Login
                                        </button>
                                    </>
                                )}

                                {/* Mobile menu button */}
                                <div className="sm:hidden ml-4">
                                    <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="sr-only">Open main menu</span>
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
                    <DisclosurePanel className="sm:hidden bg-gray-800 shadow-xl">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    as={NavLink}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        classNames(
                                            isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "block px-3 py-2 rounded-md text-base font-medium flex items-center relative transition-colors duration-200"
                                        )
                                    }
                                >
                                    <FontAwesomeIcon 
                                        icon={item.icon} 
                                        className={classNames(
                                            location.pathname === item.href ? "text-white" : "text-gray-400",
                                            "mr-3"
                                        )} 
                                    />
                                    {item.name}
                                    {item.name === "Cart" && cartCount > 0 && (
                                        <span className="ml-auto bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                            {cartCount}
                                        </span>
                                    )}
                                </DisclosureButton>
                            ))}
                            {isAuthenticated ? (
                                <div className="pt-4 pb-2 border-t border-gray-700">
                                    <div className="flex items-center px-4">
                                        <img
                                            className="h-10 w-10 rounded-full border-2 border-indigo-400"
                                            src={user?.avatar || FALLBACK_AVATAR}
                                            alt="User profile"
                                        />
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">{user?.name}</div>
                                            <div className="text-xs text-gray-300">Active</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <DisclosureButton
                                            as={NavLink}
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                                        >
                                            Your Profile
                                        </DisclosureButton>
                                        <DisclosureButton
                                            as="button"
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-gray-700 hover:text-rose-400 rounded-md transition-colors duration-200"
                                        >
                                            Sign out
                                        </DisclosureButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-gray-700 space-y-2">
                                    <DisclosureButton
                                        as={NavLink}
                                        to="/login"
                                        className="block w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200"
                                    >
                                        Login
                                    </DisclosureButton>
                                    <DisclosureButton
                                        as={NavLink}
                                        to="/register"
                                        className="block w-full px-4 py-2 text-sm font-medium text-indigo-100 rounded-md bg-indigo-900/30 hover:bg-indigo-900/40 transition-colors duration-200"
                                    >
                                        Create Account
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