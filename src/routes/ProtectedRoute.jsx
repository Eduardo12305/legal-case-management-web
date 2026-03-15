import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, bootstrapping, pendingPasswordChange } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return <div className="center-card">Carregando sessao...</div>
  }

  if (pendingPasswordChange) {
    return <Navigate to="/change-password" replace state={{ from: location }} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
