import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import bloodLogo from "../assets/blood_logo.png";

const WEBSITE_NAME = import.meta.env.VITE_WEBSITE_NAME || "OneDrop";

export default function Header({ currentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAuthenticated = Boolean(currentUser || localStorage.getItem("token"));

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const rolePathMap = {
    donor: "/donor",
    hospital: "/hospital",
    "blood-lab": "/lab",
    admin: "/admin",
  };

  const resolvedRole = currentUser?.role || localStorage.getItem("role");
  const dashboardPath = rolePathMap[resolvedRole] || "/login";

  const authLinks = isAuthenticated
    ? [
        { name: "Dashboard", path: dashboardPath },
        {
          name: "Profile",
          path: resolvedRole === "donor" ? "/donor/profile" : dashboardPath,
        },
      ]
    : [
        { name: "Login", path: "/login" },
        { name: "Register as Donor", path: "/register/donor" },
        { name: "Register as Facility", path: "/register/facility" },
      ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setMobileOpen(false);
    window.location.href = "/login";
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo + Title */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="relative w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <span className="absolute inset-0 rounded-2xl bg-red-500/20 blur-md group-hover:bg-red-500/30 transition-colors duration-300" />
              <span className="absolute inset-0 rounded-2xl border border-red-300/70 group-hover:border-red-500/70 animate-pulse" />
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 p-1.5 shadow-xl group-hover:shadow-red-300/70 transition-all duration-300">
                <img
                  src={bloodLogo}
                  alt="OneDrop Logo"
                  className="w-full h-full object-contain rounded-lg bg-white/95"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200 leading-tight">
                {WEBSITE_NAME}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "text-red-700 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
                
              </Link>
            ))}
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Auth Links */}
            {authLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  link.name.includes("Register")
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 hover:scale-105"
                    : isActiveLink(link.path)
                    ? "text-red-700 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-700 hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              mobileOpen 
                ? "bg-red-50 text-red-600" 
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "rotate-45" : "-translate-y-1.5"
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                mobileOpen ? "-rotate-45" : "translate-y-1.5"
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="border-t border-gray-200 pt-4 pb-6 px-3 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-lg">
            {/* Main Navigation Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Auth Links */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    link.name.includes("Register")
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg text-center hover:shadow-xl"
                      : isActiveLink(link.path)
                      ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600 text-center"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}