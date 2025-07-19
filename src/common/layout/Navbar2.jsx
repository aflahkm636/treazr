import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faHouse, faHeart, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthProvider";
import { useMemo, useCallback } from "react";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const FALLBACK_AVATAR = "src/assets/profile.png";

const AuthMenuItems = ({ isAuthenticated, logout }) => {
    const getMenuItemClass = useCallback((focus) => 
        classNames(
            focus ? "bg-gray-100" : "",
            "block px-4 py-2 text-sm text-gray-700"
        ),
    []);

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
                            "w-full text-left"
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

const NavLinkItem = ({ item }) => {
    const getNavLinkClass = useCallback((isActive) => 
        classNames(
            isActive ? "text-white border-b-2 border-white" : "text-gray-200 hover:text-white",
            "px-3 py-2 text-sm font-medium flex items-center no-underline transition-colors duration-200"
        ),
    []);

    return (
        <NavLink
            key={item.name}
            to={item.href}
            className={getNavLinkClass}
        >
            <FontAwesomeIcon icon={item.icon} className="mr-2" />
            <span className="hidden md:inline">{item.name}</span>
        </NavLink>
    );
};

export default function NavBar2() {
    const { user, isAuthenticated, logout } = useAuth();
  
    const navigation = useMemo(
        () => [
            { name: "Home", href: "/", icon: faHouse },
            { name: "Products", href: "/products", icon: faBoxesStacked },
            ...(isAuthenticated 
                ? [{ name: "Wishlist", href: "/wishlist", icon: faHeart }] 
                : []),
            { name: "Cart", href: "/cart", icon: faCartShopping },
        ],
        [isAuthenticated]
    );

    return (
        <Disclosure as="nav" className="fixed top-0 w-full z-50 bg-gray-800/90 backdrop-blur-sm">
            {({ open }) => (
                <>
                    <div className="mx-auto px-2 sm:px-4 lg:px-6">
                        <div className="relative flex h-16 items-center justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                <DisclosureButton 
                                    className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:bg-gray-700 hover:text-white focus:outline-none"
                                    aria-label={open ? "Close menu" : "Open menu"}
                                >
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                            </div>
                            
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex shrink-0 items-center">
                                    <span className="text-white font-bold text-xl">Treazr</span>
                                </div>
                                <div className="hidden sm:ml-4 sm:block">
                                    <div className="flex space-x-2 md:space-x-4">
                                        {navigation.map((item) => (
                                            <NavLinkItem key={item.name} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side elements */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-2">
                                {/* User name - hidden on mobile, shown on sm+ */}
                                {user?.name && (
                                    <span className="hidden sm:inline text-white text-sm font-medium">
                                        {user.name}
                                    </span>
                                )}
                                
                                {/* Profile dropdown */}
                                <Menu as="div" className="relative">
                                    <MenuButton 
                                        className="relative flex rounded-full text-sm focus:outline-none"
                                        aria-label="User menu"
                                    >
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={user?.avatar || FALLBACK_AVATAR}
                                            alt="User profile"
                                            width={32}
                                            height={32}
                                        />
                                    </MenuButton>
                                    <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white/95 backdrop-blur-sm py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <AuthMenuItems isAuthenticated={isAuthenticated} logout={logout} />
                                    </MenuItems>
                                </Menu>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <DisclosurePanel className="sm:hidden bg-gray-800/95">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item.name}
                                    as={NavLink}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        classNames(
                                            isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                            "block rounded-md px-3 py-2 text-base font-medium flex items-center no-underline"
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={item.icon} className="mr-3 w-5" />
                                    {item.name}
                                </DisclosureButton>
                            ))}
                        </div>
                        {user?.name && (
                            <div className="border-t border-gray-700 px-4 py-3">
                                <div className="flex items-center">
                                    <img
                                        className="h-8 w-8 rounded-full mr-3"
                                        src={user?.avatar || FALLBACK_AVATAR}
                                        alt="User profile"
                                    />
                                    <span className="text-white text-sm font-medium">
                                        {user.name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}