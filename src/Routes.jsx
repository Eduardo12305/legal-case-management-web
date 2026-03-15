import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import AboutPage from './pages/AboutPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import ScrollToHash from './routes/ScrollToHash'
import ChangePasswordPage from './pages/ChangePasswordPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyProcessesPage from './pages/MyProcessesPage'
import NotFoundPage from './pages/NotFoundPage'
import ProcessDetailsPage from './pages/ProcessDetailsPage'
import ProcessFormPage from './pages/ProcessFormPage'
import ProcessesPage from './pages/ProcessesPage'
import PracticeAreasPage from './pages/PracticeAreasPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/UsersPage'
import { ROLES } from './utils/roles'

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/atuacao" element={<PracticeAreasPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route
                element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.LAWYER]} />}
              >
                <Route path="/users" element={<UsersPage />} />
              </Route>

              <Route
                element={<RoleRoute allowedRoles={[ROLES.CLIENT]} />}
              >
                <Route path="/my-processes" element={<MyProcessesPage />} />
              </Route>

              <Route
                element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.LAWYER, ROLES.CLIENT]} />}
              >
                <Route path="/processes/:id" element={<ProcessDetailsPage />} />
              </Route>

              <Route
                element={
                  <RoleRoute
                    allowedRoles={[ROLES.ADMIN, ROLES.LAWYER]}
                  />
                }
              >
                <Route path="/processes" element={<ProcessesPage />} />
              </Route>

              <Route
                element={<RoleRoute allowedRoles={[ROLES.LAWYER]} />}
              >
                <Route path="/processes/new" element={<ProcessFormPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
