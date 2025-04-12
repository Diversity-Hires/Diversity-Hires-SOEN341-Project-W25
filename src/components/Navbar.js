import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import Logo from "../images/Logo.png";
import DmIcon from "../images/DmIcon.png";
import GcIcon from "../images/GcIcon.png";
import { setUserOffline, isUserAway, toggleUserAway } from "../presence";
import Switch from "react-switch";
import ViewRequests from "./ViewRequests";

export default function Navbar({
  user,
  serverMode,
  toggleServerMode,
  setOpenSnek,
  joinRequestsForUser = [],
  getRequests,
}) {
  const [isAway, setIsAway] = useState(null);
  const [openViewRequests, setOpenViewRequests] = useState(false);

  // Load "away" status on mount or when user/serverMode changes
  useEffect(() => {
    if (!user) return;
    isUserAway(user)
      .then(setIsAway)
      .catch((err) => console.error(err));
  }, [user, serverMode]);

  const handleViewRequests = () => {
    setOpenViewRequests(true);
  };

  const logout = () => {
    setUserOffline(user);
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Navigation links (Servers or DM)
  const navigation = [
    { name: "Servers", icon: GcIcon },
    { name: "DM", icon: DmIcon },
  ];

  // Example user actions (Away toggle, sign out)
  const ActiveToggleSwitch = () => (
    <div className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100">
      <span className="text-gray-700 font-medium">Away</span>
      <Switch
        checked={!!isAway}
        onChange={() => {
          toggleUserAway(user);
          setIsAway(!isAway);
        }}
        offColor="#ccc"
        onColor="#0f0"
        className="react-switch"
      />
    </div>
  );

  const userNavigation = [
    { name: "Away", component: ActiveToggleSwitch }, // Renders the toggle
    { name: "Sign out", onClick: logout },
  ];

  // Utility for styling
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gradient-to-t from-purple-200 to-purple-400 text-violet-800">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex h-20 items-center justify-between w-full">
                {/* Left Section: Logo and Navigation */}
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      alt="ChatHaven Logo"
                      src={Logo}
                      className="h-12 md:h-14 lg:h-16 xl:h-20 mr-2 ml-3"
                    />
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-2">
                      {navigation.map((item) => {
                        const isActive =
                          (item.name === "Servers" && serverMode) ||
                          (item.name === "DM" && !serverMode);

                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              // Toggle serverMode if the user clicked the inactive mode
                              if (
                                (item.name === "Servers" && !serverMode) ||
                                (item.name === "DM" && serverMode)
                              ) {
                                toggleServerMode();
                              }
                            }}
                            aria-current={isActive ? "page" : undefined}
                            className={classNames(
                              isActive
                                ? "bg-blue-200 text-violet-700"
                                : "text-violet-700 hover:bg-blue-200 hover:text-white",
                              "rounded-md text-sm mx-3 my-2"
                            )}
                          >
                            <div className="flex justify-center items-center gap-1 mx-3 my-2">
                              {item.name}
                              <img alt={`${item.name} Icon`} src={item.icon} className="h-6" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Section (Desktop): Notifications & User Menu */}
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button
                      type="button"
                      onClick={handleViewRequests}
                      className={classNames(
                        "relative rounded-full p-1 text-violet-800 hover:text-white",
                        joinRequestsForUser.length > 0 ? "bg-rose-500 rounded-3xl" : ""
                      )}
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View notifications</span>
                      <BellIcon aria-hidden="true" className="size-6" />
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <MenuButton
                        className="relative flex max-w-xs items-center rounded-full hover:text-white text-sm"
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <div className="flex justify center items-center gap-2">
                          <UserIcon aria-hidden="true" className="size-6" />
                          <span className="text-base">{user}</span>
                        </div>
                      </MenuButton>

                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                      >
                        {userNavigation.map((item) => (
                          <MenuItem key={item.name}>
                            {item.component ? (
                              // If this nav item is a component (like Away toggle)
                              item.component()
                            ) : item.onClick ? (
                              // Otherwise if there's an onClick
                              <button
                                type="button"
                                onClick={item.onClick}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {item.name}
                              </button>
                            ) : (
                              // If it’s just a link
                              <a
                                href={item.href || "#"}
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

              {/* Mobile Menu Button */}
              <div className="-mr-2 flex md:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                  <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => {
                const isActive =
                  (item.name === "Servers" && serverMode) ||
                  (item.name === "DM" && !serverMode);

                return (
                  <DisclosureButton
                    key={item.name}
                    as="button"
                    type="button"
                    onClick={() => {
                      if (
                        (item.name === "Servers" && !serverMode) ||
                        (item.name === "DM" && serverMode)
                      ) {
                        toggleServerMode();
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={classNames(
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                );
              })}
            </div>

            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-5">
                {/* If user is an object with name/email/imageUrl, conditionally render */}
                {/* Otherwise, remove or adapt this block */}
                <div className="shrink-0">
                  {/* Add a fallback if user.imageUrl might be undefined */}
                  <img
                    alt={user?.name || "User avatar"}
                    src={user?.imageUrl || ""}
                    className="size-10 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base text-white">{user?.name}</div>
                  <div className="text-sm text-gray-400">{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleViewRequests}
                  className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white"
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
                    as="button"
                    type="button"
                    onClick={item.onClick}
                    className="block w-full text-left rounded-md px-3 py-2 text-base text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {item.component ? item.component() : item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>

        {/* Request Dialog */}
        <ViewRequests
          open={openViewRequests}
          setOpen={setOpenViewRequests}
          requests={joinRequestsForUser}
          currentUser={user}
          refresh={getRequests}
        />
      </div>
    </>
  );
}

// Example prop validation
Navbar.propTypes = {
  user: PropTypes.oneOfType([
    // Possibly a string if user is just a username
    PropTypes.string,
    // or an object if user has {name, email, imageUrl}
    PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      imageUrl: PropTypes.string,
    }),
  ]),
  serverMode: PropTypes.bool,
  toggleServerMode: PropTypes.func.isRequired,
  setOpenSnek: PropTypes.func,
  joinRequestsForUser: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  getRequests: PropTypes.func,
};