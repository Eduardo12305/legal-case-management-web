import { NavLink, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import {
  canCreateProcesses,
  canManageUsers,
  canViewProcessesMenu,
  isClient,
} from '../utils/roles'

function AppLayout() {
  const { user, role, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-row">
          <div className="brand-area">
            <p className="eyebrow">Advon Client</p>
            <h1>Plataforma para operacao juridica e relacionamento comercial</h1>
          </div>

          <div className="header-account">
            <div className="topbar-badge">
              <span>Perfil ativo</span>
              <strong>{role || 'Usuario'}</strong>
            </div>
            <button type="button" className="secondary-button" onClick={logout}>
              Sair
            </button>
          </div>
        </div>

        <nav className="top-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/profile">Perfil</NavLink>
          {canManageUsers(role) && <NavLink to="/users">Usuarios</NavLink>}
          {canViewProcessesMenu(role) && (
            <NavLink to="/processes" end>
              Processos
            </NavLink>
          )}
          {canCreateProcesses(role) && <NavLink to="/processes/new">Novo processo</NavLink>}
          {isClient(role) && <NavLink to="/my-processes">Meus processos</NavLink>}
        </nav>
      </header>

      <main className="page-shell">
        <header className="topbar">
          <div className="topbar-content">
            <p className="eyebrow">Painel operacional</p>
            <h2>{user?.name || user?.fullName || user?.email || 'Portal de atendimento'}</h2>
          </div>
          <div className="topbar-badge">
            <span>Conta</span>
            <strong>{user?.email || 'Sem email'}</strong>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
