import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import PainelManutencoesPendentes from "./components/PainelManutencoesPendentes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MeusAtivosPage from "./pages/MeusAtivosPage";
import HistoricoPage from "./pages/HistoricoPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

// Componente para lidar com a lógica de redirecionamento inicial
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Rotas Públicas para Login e Registro */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/registrar" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
      </Route>

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}> {/* Envolve as rotas que precisam de Layout principal */}
        <Route element={<Layout />}> {/* Layout principal com Sidebar */}
          <Route path="/" element={<PainelManutencoesPendentes />} />
          <Route path="/meus-ativos" element={<MeusAtivosPage />} />
          <Route path="/historico" element={<HistoricoPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          {/* Adicione outras rotas protegidas aqui */}
        </Route>
      </Route>
      
      {/* Rota para páginas não encontradas (opcional, mas bom ter) */}
      <Route path="*" element={<div>Página Não Encontrada (404)</div>} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}