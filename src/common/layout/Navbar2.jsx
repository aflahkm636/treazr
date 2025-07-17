import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faHouse, faHeart, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../context/AuthProvider';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar2() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const navigation = [
    { name: 'Home', href: '/', icon: faHouse },
    { name: 'Products', href: '/products', icon: faBoxesStacked },
    isAuthenticated && { name: 'Wishlist', href: '/wishlist', icon: faHeart },
    { name: 'Cart', href: '/cart', icon: faCartShopping },
  ].filter(Boolean);

  return (
   <Disclosure as="nav" className="bg-gray-800">
  {({ open }) => (
    <>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {open ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <span className="text-white font-bold text-xl">
                Treazr
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => classNames(
                      isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium flex items-center'
                    )}
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-2" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          
          {/* Profile dropdown with auth integration */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user?.avatar || 'src/assets/profile.png'}
                    alt="User profile"
                  />
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {isAuthenticated ? (
                  <>
                    <MenuItem>
                      {({ focus }) => (
                        <NavLink
                          to="/profile"
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Your Profile
                        </NavLink>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={logout}
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block w-full text-left px-4 py-2 text-sm text-gray-700'
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
                        <NavLink
                          to="/login"
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Login
                        </NavLink>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <NavLink
                          to="/register"
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Register
                        </NavLink>
                      )}
                    </MenuItem>
                  </>
                )}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

     <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={NavLink}
              to={item.href}
              className={({ isActive }) => classNames(
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium flex items-center'
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="mr-2" />
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </>
  )}
</Disclosure>
  )
}