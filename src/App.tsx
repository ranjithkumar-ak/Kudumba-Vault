import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VaultProvider, useVault } from "@/context/VaultContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UploadPage from "@/pages/UploadPage";
import DocumentsPage from "@/pages/DocumentsPage";
import SharingPage from "@/pages/SharingPage";
import MembersPage from "@/pages/MembersPage";
import RecoveryPage from "@/pages/RecoveryPage";
import AlertsPage from "@/pages/AlertsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useVault();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const LoginGuard = () => {
  const { isLoggedIn } = useVault();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <VaultProvider>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/sharing" element={<ProtectedRoute><SharingPage /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            <Route path="/recovery" element={<ProtectedRoute><RecoveryPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </VaultProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
