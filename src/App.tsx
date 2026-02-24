import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import PersonDetailsPage from "./pages/PersonDetailsPage";
import PersonFormModal from "./components/PersonFormModal";
import { Spinner, ToastContainer, useToast } from "./components/ui";

const ROUTE_TO_PAGE: Record<string, string> = {
  "/data": "data",
  "/analysis": "analysis",
  "/admins": "admins",
};

const PAGE_TO_ROUTE: Record<string, string> = {
  data: "/data",
  analysis: "/analysis",
  admins: "/admins",
};

const AuthInitializingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <Spinner size="lg" />
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { state, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();

  if (!state.initialized) {
    return <AuthInitializingScreen />;
  }

  if (!state.user || !state.token) {
    return <Navigate to="/login" replace />;
  }

  const currentPage = ROUTE_TO_PAGE[location.pathname] || "data";

  const handleNavigate = (page: string) => {
    const nextRoute = PAGE_TO_ROUTE[page] || "/data";
    navigate(nextRoute);
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
    toast.success(wasEditing ? "Saved successfully" : "Added successfully");
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <Routes>
          <Route
            path="/data"
            element={
              <DataPage
                key={refreshKey}
                onAddPerson={handleAddPerson}
                onEditPerson={handleEditPerson}
              />
            }
          />
          <Route path="/analysis" element={<AnalysisPage key={refreshKey} />} />
          <Route
            path="/admins"
            element={
              hasPermission("manage_admins") ? (
                <AdminManagementPage />
              ) : (
                <Navigate to="/data" replace />
              )
            }
          />
          <Route path="/persons/:id" element={<PersonDetailsPage />} />
          <Route path="/" element={<Navigate to="/data" replace />} />
          <Route path="*" element={<Navigate to="/data" replace />} />
        </Routes>
      </AppLayout>

      <PersonFormModal
        isOpen={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
        }}
        person={editingPerson}
        onSuccess={handlePersonFormSuccess}
      />

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  );
};

const LoginRoute: React.FC = () => {
  const { state } = useAuth();

  if (!state.initialized) {
    return <AuthInitializingScreen />;
  }

  if (state.user && state.token) {
    return <Navigate to="/data" replace />;
  }

  return <LoginPage />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route path="/*" element={<ProtectedLayout />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
