import React, { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { state, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* User Menu and Mobile Menu Button */}
        <div className="flex items-center space-x-reverse space-x-2">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-reverse space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="hidden xs:block text-right">
                <div className="text-sm font-medium text-gray-700">
                  {state.user?.username}
                </div>
                <div className="text-xs text-gray-500">
                  {state.user?.role === "super_admin" ? "أمين الخدمة" : "خادم"}
                </div>
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute left-0 lg:left-auto right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {state.user?.username}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {state.user?.role === "super_admin"
                        ? "أمين الخدمة"
                        : "خادم"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} className="ml-3" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center space-x-reverse space-x-2">
          <h1 className="text-lg font-semibold text-gray-800 hidden xs:block">
            نظام الافتقاد
          </h1>
          <div className="text-gray-800 font-bold text-lg px-3 py-2 rounded-xl shadow-sm">
            KAF
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
