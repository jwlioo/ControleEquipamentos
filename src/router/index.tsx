import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { LayoutRoute } from './LayoutRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Equipamentos from '../pages/Equipamentos';
import EquipamentoDetalhe from '../pages/EquipamentoDetalhe';
import EquipamentoForm from '../pages/EquipamentoForm';
import Garantias from '../pages/Garantias';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected + Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LayoutRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipamentos" element={<Equipamentos />} />
              <Route path="/equipamentos/novo" element={<EquipamentoForm />} />
              <Route path="/equipamentos/:id" element={<EquipamentoDetalhe />} />
              <Route path="/equipamentos/:id/editar" element={<EquipamentoForm />} />
              <Route path="/garantias" element={<Garantias />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
