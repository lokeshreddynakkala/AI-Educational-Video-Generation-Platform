import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import WizardPage from './pages/WizardPage'
import './App.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create', label: 'Create Project' },
  { to: '/wizard', label: 'Wizard' }
]

function AppShell() {
  const location = useLocation()
  const isCreatePage = location.pathname === '/create'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">Educational Video Platform</p>
          <h1>EduVideo Studio</h1>
          <p className="brand-copy">
            Turn a topic into a narrated educational video with a simple guided flow.
          </p>
        </div>

        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <p>Workflow</p>
            <strong>Setup / Script / Slides / Voice / Render</strong>
          </div>
        </div>
      </aside>

      <main className={`app-main${isCreatePage ? ' create-mode' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/wizard" element={<WizardPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
