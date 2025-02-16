import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import Logo from '../images/Logo.png';


const navigation = [
  { name: 'Dashboard', href: '#', current: true },
//   { name: 'Team', href: '#', current: false },
//   { name: 'Projects', href: '#', current: false },
//   { name: 'Calendar', href: '#', current: false },
//   { name: 'Reports', href: '#', current: false },
]

const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', onClick: logout },
]



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({user}) {


    return (
        <>
            <div className="min-h-full">
                <Disclosure as="nav" className="bg-gradient-to-t from-purple-200 to-purple-400 text-violet-800 ">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between"> 
    
                        <div className="flex h-20 items-center justify-between w-full">
    
                        {/* Left Section: Logo and Navigation */}
                        <div className="flex items-center">
                            <div className="shrink-0">
                                <img
                                    alt="Your Company"
                                    src={Logo}
                                    className="h-12 md:h-14 lg:h-16 xl:h-20 mr-2"
                                />
                            </div>
                            <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(
                                    item.current ? 'bg-violet-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                    'rounded-md px-3 py-2 text-sm font-medium',
                                    )}
                                >
                                    {item.name}
                                </a>
                                ))}
                            </div>
                        </div>
                    </div>
    
    
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                        <button
                            type="button"
                            className="relative rounded-full p-1 text-violet-800 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                        >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">View notifications</span>
                            <BellIcon aria-hidden="true" className="size-6" />
                        </button>
    
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                            
                                <MenuButton className="relative flex max-w-xs items-center rounded-full hover:text-white text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">Open user menu</span>
                                    <div className="flex justify center items-center gap-2">
                                        <UserIcon aria-hidden="true" className="size-6" />
                                        {user}
                                        </div>
                                </MenuButton>
                                {/* display current user */}
                                
                                
                            
                            <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                            >
                            
                            {userNavigation.map((item) => (
                                <MenuItem key={item.name}>
                                    {item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {item.name}
                                    </button>
                                    ) : (
                                    <a
                                        href={item.href}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {item.name}
                                    </a>
                                    )}
                                </MenuItem>
                                ))}

                            </MenuItems>
                        </Menu>
                        </div>
                    </div>
                    </div>
    
                  
    
    
    
                  <div className="-mr-2 flex md:hidden">
    
                    {/* Mobile menu button */}
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                      <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                    </DisclosureButton>
                  </div>
                </div>
              </div>
    
                <DisclosurePanel className="md:hidden">
                    <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                    {navigation.map((item) => (
                        <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'block rounded-md px-3 py-2 text-base font-medium',
                        )}
                        >
                        {item.name}
                        </DisclosureButton>
                    ))}
                    </div>
                    <div className="border-t border-gray-700 pt-4 pb-3">
                    <div className="flex items-center px-5">
                        <div className="shrink-0">
                        <img alt="" src={user.imageUrl} className="size-10 rounded-full" />
                        </div>
                        <div className="ml-3">
                        <div className="text-base/5 font-medium text-white">{user.name}</div>
                        <div className="text-sm font-medium text-gray-400">{user.email}</div>
                        </div>
                        <button
                        type="button"
                        className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                        >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">View notifications</span>
                        <BellIcon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                        {userNavigation.map((item) => (
                            <DisclosureButton
                                key={item.name}
                                as={item.onClick ? "button" : "a"}
                                href={item.href}
                                onClick={item.onClick ? item.onClick : undefined}
                                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                {item.name}
                            </DisclosureButton>
                            ))}

                    </div>
                    </div>
                </DisclosurePanel>
                </Disclosure>
    
    
            </div>
        </>
      )
}
