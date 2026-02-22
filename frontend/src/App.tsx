import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PanelPage } from './pages/PanelPage';
import { ConsolePage } from './pages/ConsolePage';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <PanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/console/:identifier"
        element={
          <ProtectedRoute>
            <ConsolePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
