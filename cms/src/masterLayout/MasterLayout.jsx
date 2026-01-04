import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { useAuth } from "../context/AuthContext";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const sidebarItems = [
    { path: "/admins", label: "Admins", icon: "line-md:account" },
    { path: "/users", label: "Users", icon: "line-md:account" },
    { path: "/static-info", label: "Static Info", icon: "line-md:account" },
    { path: "/broadcasters", label: "Broadcasters", icon: "line-md:account" },
    { path: "/programs", label: "Programs", icon: "line-md:account" },
    { path: "/news", label: "News", icon: "line-md:account" },
    { path: "/events", label: "Events & Partnerships", icon: "line-md:account" },
    { path: "/advertisement", label: "Advertisement Requests", icon: "line-md:account" },
    { path: "/interview-applicants", label: "Interview Applicants", icon: "line-md:account" },
    { path: "/uploaded-tracks", label: "Uploaded Tracks", icon: "line-md:account" },
    // {
    //   path: "/categories",
    //   label: "Categories",
    //   icon: "material-symbols:category-rounded",
    // },
    // {
    //   path: "/products",
    //   label: "Products",
    //   icon: "line-md:clipboard-list-twotone",
    // },
    // {
    //   path: "/quotations",
    //   label: "Quotations",
    //   icon: "line-md:briefcase-twotone",
    // },
    // {
    //   path: "/files",
    //   label: "Files Center",
    //   icon: "line-md:folder-settings-twotone",
    // },
    // { path: "/contact-us", label: "Contact Us", icon: "line-md:chat-twotone" },
    // { path: "/gallery", label: "Gallery", icon: "line-md:image-twotone" },
    // {
    //   path: "/videoGallery",
    //   label: "Video Gallery",
    //   icon: "line-md:image-twotone",
    // },
    // {
    //   path: "/posts",
    //   label: "Job Posts",
    //   icon: "material-symbols:post-add-rounded",
    // },
    // { path: "/cvs", label: "CVs", icon: "material-symbols:post-add-rounded" },
  ];

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn"
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/" className="sidebar-logo">
            <img
              src="/assets/images/Seagulls-logo.svg"
              alt="site logo"
              className="light-logo mx-auto"
            />
            <img
              src="/assets/images/Seagulls-logo.svg"
              alt="site logo"
              className="dark-logo mx-auto"
            />
            <img
              src="/assets/images/Seagulls-logo.svg"
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">
            {user && (
              <>
                {/* Dashboard */}
                {user.role && user.role.toLowerCase() === "superadmin" && (
                  <li>
                    <NavLink
                      to="/"
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <Icon
                        icon="line-md:home-simple-twotone"
                        className="menu-icon"
                      />
                      <span>Dashboard</span>
                    </NavLink>
                  </li>
                )}

                {sidebarItems
                  .filter((item) => {
                    const role = user.role?.toLowerCase?.();
                    if (role === "superadmin") return true;

                    const cap = (str) =>
                      str.charAt(0).toUpperCase() + str.slice(1);
                    const routeName = cap(item.path.replace("/", ""));
                    return user.permissions?.includes(routeName);
                  })
                  .map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={(navData) =>
                          navData.isActive ? "active-page" : ""
                        }
                      >
                        <Icon icon={item.icon} className="menu-icon" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
              </>
            )}
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {/* ThemeToggleButton */}
                <ThemeToggleButton />

                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    {loading ? (
                      <div className="w-40-px h-40-px rounded-circle bg-neutral-200 animate-pulse" />
                    ) : (
                      <img
                        src={
                          user?.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "User"
                          )}&size=128`
                        }
                        alt="user"
                        className="w-40-px h-40-px object-fit-cover rounded-circle"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "User"
                          )}&size=128`;
                        }}
                      />
                    )}
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">
                          {loading ? (
                            <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
                          ) : (
                            user?.name || user?.email || "User"
                          )}
                        </h6>
                        <span className="text-secondary-light fw-medium text-sm">
                          {loading ? (
                            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                          ) : (
                            user?.role || "Admin"
                          )}
                        </span>
                      </div>
                      <button type="button" className="hover-text-danger">
                        <Icon
                          icon="radix-icons:cross-1"
                          className="icon text-xl"
                        />
                      </button>
                    </div>
                    <ul className="to-top-list">
                      <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/profile"
                        >
                          <Icon
                            icon="solar:user-linear"
                            className="icon text-xl"
                          />{" "}
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 w-100"
                        >
                          <Icon icon="lucide:power" className="icon text-xl" />{" "}
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">{children}</div>
      </main>
    </section>
  );
};

export default MasterLayout;
