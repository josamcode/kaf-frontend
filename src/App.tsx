import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import PersonFormModal from "./components/PersonFormModal";

const AppContent: React.FC = () => {
  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState("data");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  // If not logged in, show login page
  if (!state.user || !state.token) {
    return <LoginPage />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowPersonForm(true);
  };

  const handleEditPerson = (person: any) => {
    setEditingPerson(person);
    setShowPersonForm(true);
  };

  const handlePersonFormSuccess = () => {
    setShowPersonForm(false);
    setEditingPerson(null);
    // Refresh the current page data
    window.location.reload();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "data":
        return (
          <DataPage
            onAddPerson={handleAddPerson}
            onEditPerson={handleEditPerson}
          />
        );
      case "analysis":
        return <AnalysisPage />;
      case "admins":
        return <AdminManagementPage />;
      default:
        return (
          <DataPage
            onAddPerson={handleAddPerson}
            onEditPerson={handleEditPerson}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <Sidebar
          isOpen={isMenuOpen}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 lg:mr-64 flex flex-col">
          <div className="flex-1">{renderCurrentPage()}</div>
        </main>
      </div>

      {/* Person Form Modal */}
      <PersonFormModal
        isOpen={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
        }}
        person={editingPerson}
        onSuccess={handlePersonFormSuccess}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
