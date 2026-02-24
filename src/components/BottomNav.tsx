import React from "react";
import { Database, BarChart3, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { hasPermission } = useAuth();

  const tabs = [
    { id: "data", label: "البيانات", icon: Database, permission: null },
    { id: "analysis", label: "التحليلات", icon: BarChart3, permission: null },
    {
      id: "admins",
      label: "الخدام",
      icon: Users,
      permission: "manage_admins" as const,
    },
  ];

  const visibleTabs = tabs.filter(
    (tab) => !tab.permission || hasPermission(tab.permission),
  );

  return (
    <>
      {/* ========== Mobile Bottom Nav ========== */}
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="glass-heavy border-t border-surface-200/50 shadow-nav">
          <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPage === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 flex-1
                    py-2 min-h-[3.75rem] relative
                    transition-all duration-200 touch-target
                    ${
                      isActive
                        ? "text-primary-600"
                        : "text-surface-400 active:text-surface-600"
                    }
                  `}
                >
                  {/* Active indicator — top line */}
                  {isActive && (
                    <div className="absolute top-0 inset-x-5 h-[2.5px] bg-primary-500 rounded-b-full" />
                  )}

                  <div
                    className={`
                      p-1.5 rounded-xl transition-all duration-200
                      ${isActive ? "bg-primary-50" : ""}
                    `}
                  >
                    <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>

                  <span
                    className={`
                      text-[10px] leading-none font-bold
                      ${isActive ? "text-primary-700" : "text-surface-500"}
                    `}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ========== Desktop Sidebar ========== */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 xl:w-60 bg-white border-l border-surface-200/50 h-full">
        {/* Nav items */}
        <nav className="flex-1 p-3 pt-5">
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.08em] mb-3 px-3">
            القائمة الرئيسية
          </p>
          <ul className="space-y-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPage === tab.id;

              return (
                <li key={tab.id}>
                  <button
                    onClick={() => onNavigate(tab.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                      transition-all duration-200 group relative
                      ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-surface-600 hover:bg-surface-50 hover:text-surface-800"
                      }
                    `}
                  >
                    {/* Active bar */}
                    {isActive && (
                      <div className="absolute right-0 top-2 bottom-2 w-[3px] bg-primary-500 rounded-l-full" />
                    )}

                    <div
                      className={`
                        p-1.5 rounded-lg transition-colors duration-200
                        ${
                          isActive
                            ? "bg-primary-100 text-primary-700"
                            : "bg-surface-100 text-surface-500 group-hover:bg-surface-200 group-hover:text-surface-700"
                        }
                      `}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="font-bold text-[13px]">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-100">
          <div className="text-center py-1">
            <p className="text-[11px] font-bold text-surface-500">نظام KAF</p>
            <p className="text-[10px] text-surface-400 mt-0.5">الإصدار 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default BottomNav;
