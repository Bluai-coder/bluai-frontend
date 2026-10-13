"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LogOut, Menu, X, PanelLeftClose,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Key,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";

import { useAuthStore } from "@/lib/auth-store";
import Image from "next/image";
import { toast } from "sonner";

export default function AppLayout({ children, menuConfig, permissionAction, basePath }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Set default expanded sections to all section names
  const [expandedSections, setExpandedSections] = useState(
    menuConfig.map(s => s.section)
  );

  const { theme, setTheme, resolvedTheme } = useTheme();

  const { isAuthenticated, user, logout, hasPermission, hasHydrated } = useAuthStore();

  // ================= AUTH CHECK =================
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [hasHydrated, isAuthenticated, router]);

  // ================= RESPONSIVE =================
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ================= GET PAGE TITLE =================
  const getPageTitle = () => {
    const currentPath = pathname.split("/").pop();
    const menuItem = menuConfig.flatMap(s => s.items).find(i => i.href === pathname);
    return menuItem?.name || (currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : "Dashboard");
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/patients")) return "Manage patient records and demographics";
    if (pathname.includes("/orders")) return "Create and track laboratory orders";
    if (pathname.includes("/worklist")) return "Verify and review test results";
    if (pathname.includes("/results")) return "Enter and edit test results";
    if (pathname.includes("/specimens")) return "Track specimen lifecycle";
    return "Welcome back, " + (user?.fullName || "User");
  };

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900`}>

      {/* ================= MOBILE OVERLAY ================= */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`
        fixed lg:static z-50 top-0 left-0 h-full
        transition-all duration-300 ease-in-out flex flex-col
        ${isMobile
          ? sidebarOpen ? "w-72 translate-x-0" : "-translate-x-full w-72"
          : sidebarOpen ? "w-72" : "w-20"
        }
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        shadow-xl
      `}>

        {/* ================= LOGO SECTION ================= */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            {(sidebarOpen || isMobile) && (
              <>
                <div className="dark:hidden">
                  <Image
                    src="/blu-admin-dark.png"
                    alt="BluLIMS"
                    width={80}
                    height={34}
                    className="w-auto object-contain"
                  />
                </div>
                <div className="hidden dark:block">
                  <Image
                    src="/blu-admin-dark.png"
                    alt="BluLIMS"
                    width={80}
                    height={34}
                    className=" w-auto object-contain"
                  />
                </div>
              </>
            )}
            {!sidebarOpen && !isMobile && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-sm">BluAI</span>
              </div>
            )}
          </div>

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* ================= MENU SECTION ================= */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">

          {/* Desktop Collapsed View - Quick Icons */}
          {!sidebarOpen && !isMobile && (
            <div className="space-y-1 px-2">
              {menuConfig.flatMap(section =>
                section.items.filter(item => hasPermission(item.module, permissionAction))
              ).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center justify-center py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-[#06b6d4] text-white shadow-lg"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-400"
                      }
                    `}
                    title={item.name}
                    aria-label={item.name}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Expanded View (Full Menu) */}
          {(sidebarOpen || isMobile) && (
            <div className="space-y-6">
              {menuConfig.map((section) => {
                const filteredItems = section.items.filter((item) =>
                  hasPermission(item.module, permissionAction)
                );

                if (filteredItems.length === 0) return null;
                const isExpanded = expandedSections.includes(section.section);

                return (
                  <div key={section.section} className="px-3">
                    {/* Section Header with Toggle */}
                    <button
                      onClick={() => toggleSection(section.section)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {section.section}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Menu Items */}
                    {isExpanded && (
                      <div className="mt-1 space-y-1">
                        {filteredItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => isMobile && setSidebarOpen(false)}
                              className={`
                                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                transition-all duration-200
                                ${isActive
                                  ? "bg-[#06b6d4] text-white shadow-md"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                                }
                              `}
                            >
                              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`} />
                              <span className="flex-1">{item.name}</span>
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= FOOTER SECTION ================= */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">

          {/* Dark Mode Toggle */}
          {sidebarOpen && !isMobile && (
            <button
              onClick={() => {
                if (theme === 'light') setTheme('dark');
                else if (theme === 'dark') setTheme('system');
                else setTheme('light');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={`Current: ${theme}`}
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : theme === 'dark' ? <Monitor className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
              <span>{theme === 'light' ? "Dark Mode" : theme === 'dark' ? "System Theme" : "Light Mode"}</span>
            </button>
          )}

          {/* Version Info */}
          {(sidebarOpen || isMobile) && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 px-3">
              PathLIMS v1.0.0
            </p>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3">

            <div className={`
                  w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 
                  flex items-center justify-center shadow-md flex-shrink-0
                `}>
              <span className="text-xs font-semibold text-white">
                {getInitials(user?.fullName)}
              </span>
            </div>

            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            )}


            <button
              onClick={handleLogout}
              className={`
                p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition
                ${(!sidebarOpen && !isMobile) ? "mx-auto" : ""}
              `}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-500 hover:text-red-500 transition" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ================= HEADER ================= */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ?
                <PanelLeftClose className="w-5 h-5 text-slate-600 dark:text-slate-400" /> :
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              }
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {getPageSubtitle()}
              </p>
            </div>
          </div>

          {/* Right Side Header Icons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">

              {/* Notification Bell */}
              {/* <NotificationBell /> */}

              {/* Dark Mode Toggle */}
              {isMobile && (
                <button
                  onClick={() => {
                    if (theme === 'light') setTheme('dark');
                    else if (theme === 'dark') setTheme('system');
                    else setTheme('light');
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  title={`Current: ${theme}`}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : theme === 'dark' ? <Monitor className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 min-h-0 overflow-auto bg-slate-50 dark:bg-slate-900">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
