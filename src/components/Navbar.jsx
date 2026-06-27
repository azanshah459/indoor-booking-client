import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        Indoor Management
      </Link>

      <div style={styles.links}>
        <Link to="/grounds" style={styles.link}>Grounds</Link>

        {/* Show these only when logged in as Customer */}
        {user && user.role === 'Customer' && (
          <Link to="/my-bookings" style={styles.link}>My Bookings</Link>
        )}

        {/* Show these only when logged in as Admin */}
        {user && user.role === 'Admin' && (
          <>
            <Link to="/admin" style={styles.link}>Dashboard</Link>
            <Link to="/admin/grounds" style={styles.link}>Manage Grounds</Link>
          </>
        )}

        {/* Show Login/Register when not logged in */}
        {!user && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}

        {/* Show user name and logout when logged in */}
        {user && (
          <div style={styles.userSection}>
            <span style={styles.userName}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: '60px',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    color: '#a0aec0',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }
}

export default Navbar