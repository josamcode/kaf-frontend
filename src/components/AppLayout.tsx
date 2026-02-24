import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  return (
    <div className="h-screen flex flex-col bg-surface-50" dir="rtl">
      {/* Header — sticky top */}
      <Header />

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar + Mobile bottom nav */}
        <BottomNav currentPage={currentPage} onNavigate={onNavigate} />

        {/* Main content */}
        <main
          className="
            flex-1 overflow-y-auto scrollbar-thin
            main-content
            px-4 py-4
            lg:px-6 lg:py-6
            xl:px-8
          "
        >
          <div className="max-w-screen-xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
