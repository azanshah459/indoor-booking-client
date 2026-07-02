import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        🏟️ Indoor Management
      </Link>

      {/* Hamburger button - mobile only */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Nav links */}
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/grounds" className="navbar-link" onClick={closeMenu}>
          Grounds
        </Link>

        {user && user.role === 'Customer' && (
          <Link to="/my-bookings" className="navbar-link" onClick={closeMenu}>
            My Bookings
          </Link>
        )}

        {user && user.role === 'Admin' && (
          <>
            <Link to="/admin" className="navbar-link" onClick={closeMenu}>
              Dashboard
            </Link>
            <Link to="/admin/grounds" className="navbar-link" onClick={closeMenu}>
              Manage Grounds
            </Link>
            <Link to="/admin/bookings" className="navbar-link" onClick={closeMenu}>
              All Bookings
            </Link>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className="navbar-link" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/register" className="navbar-link" onClick={closeMenu}>
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <span className="navbar-user-name">Hi, {user.name}</span>
            <button onClick={handleLogout} className="navbar-logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar