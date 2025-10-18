import React from "react";
import { Database, BarChart3, Users, Home, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentPage,
  onNavigate,
}) => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      id: "data",
      label: "البيانات",
      icon: Database,
      permission: null,
    },
    {
      id: "analysis",
      label: "التحليلات",
      icon: BarChart3,
      permission: null,
    },
    {
      id: "admins",
      label: "إدارة الخدام",
      icon: Users,
      permission: "manage_admins",
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onNavigate("")}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 right-0 h-full bg-white border-l border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto lg:h-full lg:flex-shrink-0
        w-72 lg:w-64
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo for mobile */}
          <div className="lg:hidden p-4 border-b border-gray-200">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-xl px-4 py-3 rounded-xl inline-block shadow-sm">
              KAF
            </div>
            <p className="text-sm text-gray-600 mt-2">نظام إدارة الافتقاد</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive ? "bg-primary-200" : "bg-gray-100"
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <span className="font-medium text-base">
                          {item.label}
                        </span>
                      </div>
                      {isActive && (
                        <ChevronRight
                          size={18}
                          className="text-primary-600 rotate-180"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <div className="font-medium text-gray-700 mb-1">نظام KAF</div>
              <div>إدارة الافتقاد - الإصدار 1.0.0</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
