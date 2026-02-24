import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuperAdmin = state.user?.role === "super_admin";
  const roleText = isSuperAdmin ? "أمين الخدمة" : "خادم";

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/50 safe-top">
      <div className="flex items-center justify-between h-14 px-4 lg:h-16 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-sm lg:text-base tracking-tight">
              KAF
            </span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[15px] font-bold text-surface-900 leading-none">
              نظام الافتقاد
            </h1>
            <p className="text-[11px] text-surface-400 font-medium mt-0.5 leading-none">
              إدارة البيانات والمتابعة
            </p>
          </div>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="
              flex items-center gap-2 py-1.5 px-2 rounded-xl
              hover:bg-surface-100/80 active:bg-surface-200/60
              transition-all duration-200
            "
          >
            <ChevronDown
              size={13}
              className={`text-surface-400 transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-bold text-surface-800 leading-none">
                {state.user?.username}
              </p>
              <p className="text-[11px] text-surface-500 leading-none mt-1 flex items-center gap-1">
                {/* {isSuperAdmin && <Shield size={9} />} */}
                {roleText}
              </p>
            </div>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-white">
              <User size={15} className="text-primary-700" />
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-surface-200/60 z-50 overflow-hidden animate-slide-down">
              <div className="p-4 bg-surface-50/80 border-b border-surface-100">
                <p className="font-bold text-surface-900 text-sm leading-none">
                  {state.user?.username}
                </p>
                <p className="text-xs text-surface-500 mt-1.5 flex items-center gap-1">
                  {isSuperAdmin && (
                    <Shield size={10} className="text-primary-600" />
                  )}
                  {roleText}
                </p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="
                    flex items-center gap-3 w-full px-3 py-2.5 text-sm text-danger-600
                    hover:bg-danger-50 rounded-xl transition-colors
                    active:bg-danger-100
                  "
                >
                  <LogOut size={16} />
                  <span className="font-semibold">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
