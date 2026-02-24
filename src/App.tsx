import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import PersonFormModal from "./components/PersonFormModal";
import { ToastContainer, useToast } from "./components/ui";

const AppContent: React.FC = () => {
  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState("data");
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();

  // Not logged in — show login
  if (!state.user || !state.token) {
    return <LoginPage />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
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
    const wasEditing = !!editingPerson;
    setShowPersonForm(false);
    setEditingPerson(null);
    setRefreshKey((prev) => prev + 1);
    toast.success(wasEditing ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "data":
        return (
          <DataPage
            key={refreshKey}
            onAddPerson={handleAddPerson}
            onEditPerson={handleEditPerson}
          />
        );
      case "analysis":
        return <AnalysisPage key={refreshKey} />;
      case "admins":
        return <AdminManagementPage />;
      default:
        return (
          <DataPage
            key={refreshKey}
            onAddPerson={handleAddPerson}
            onEditPerson={handleEditPerson}
          />
        );
    }
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderCurrentPage()}
      </AppLayout>

      {/* Person form modal */}
      <PersonFormModal
        isOpen={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
        }}
        person={editingPerson}
        onSuccess={handlePersonFormSuccess}
      />

      {/* Global toast notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
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
