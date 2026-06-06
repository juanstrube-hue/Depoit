import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import Returns from './pages/Returns';
import Notifications from './pages/Notifications';
import Wallet from './pages/Wallet';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import ContractNew from './pages/ContractNew';
import GuaranteeDeductions from './pages/GuaranteeDeductions';
import GuaranteeDeductionNew from './pages/GuaranteeDeductionNew';
import GuaranteeDeductionDetail from './pages/GuaranteeDeductionDetail';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-[#64748B]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/contracts"
      element={
        <ProtectedRoute>
          <Contracts />
        </ProtectedRoute>
      }
    />
    <Route
      path="/contracts/new"
      element={
        <ProtectedRoute>
          <ContractNew />
        </ProtectedRoute>
      }
    />
    <Route
      path="/contracts/:id"
      element={
        <ProtectedRoute>
          <ContractDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/guarantee-deductions"
      element={
        <ProtectedRoute>
          <GuaranteeDeductions />
        </ProtectedRoute>
      }
    />
    <Route
      path="/guarantee-deductions/new"
      element={
        <ProtectedRoute>
          <GuaranteeDeductionNew />
        </ProtectedRoute>
      }
    />
    <Route
      path="/guarantee-deductions/:id"
      element={
        <ProtectedRoute>
          <GuaranteeDeductionDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/returns"
      element={
        <ProtectedRoute>
          <Returns />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/wallet"
      element={
        <ProtectedRoute>
          <Wallet />
        </ProtectedRoute>
      }
    />
    <Route
      path="/activity"
      element={
        <ProtectedRoute>
          <ActivityPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };