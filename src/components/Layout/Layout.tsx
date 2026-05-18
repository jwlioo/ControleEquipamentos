import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Monitor,
  PlusCircle,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/equipamentos', icon: Monitor, label: 'Equipamentos' },
  { to: '/equipamentos/novo', icon: PlusCircle, label: 'Novo Equipamento' },
  { to: '/garantias', icon: AlertTriangle, label: 'Garantias' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Settings size={22} className="logo-icon" />
            {sidebarOpen && <span className="logo-text">ControleEQ</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <item.icon size={20} className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(usuario?.[0] ?? 'U').toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="user-name">{usuario ?? 'Usuário'}</span>
                <span className="user-role">Administrador</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
}
