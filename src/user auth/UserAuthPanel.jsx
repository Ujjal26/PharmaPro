import { useState } from 'react'
import { useAuth } from './AuthContext'
import './UserAuthPanel.css'

function UserAuthPanel() {
  const { currentUser, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const displayName = currentUser?.displayName || currentUser?.email || 'User'
  const role = displayName.includes('(') 
    ? displayName.match(/\(([^)]+)\)/)?.[1] 
    : 'Clinical Staff'
  const name = displayName.replace(/\s*\([^)]*\)/, '').trim()
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className="user-auth-panel">
      <button
        type="button"
        className="user-panel-btn"
        onClick={() => setMenuOpen((s) => !s)}
        aria-label="User menu"
        id="user-menu-toggle"
      >
        <div className="avatar" aria-hidden="true">{initials || '?'}</div>
        <div className="user-meta">
          <p className="name">{name}</p>
          <p className="role">{role}</p>
        </div>
        <span className="chevron" aria-hidden="true">{menuOpen ? '▲' : '▾'}</span>
      </button>

      {menuOpen && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-info">
            <div className="avatar avatar-lg">{initials || '?'}</div>
            <div>
              <p className="dd-name">{name}</p>
              <p className="dd-email">{currentUser?.email}</p>
              <p className="dd-role">{role}</p>
            </div>
          </div>
          <div className="user-dropdown-divider" />
          <button
            type="button"
            className="user-dropdown-item logout-btn"
            role="menuitem"
            id="logout-button"
            onClick={() => { setMenuOpen(false); handleLogout() }}
          >
            <span>⊗</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserAuthPanel
