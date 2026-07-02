import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GroundsPage from './pages/GroundsPage'
import SlotsPage from './pages/SlotsPage'
import MyBookingsPage from './pages/MyBookingsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminGroundsPage from './pages/AdminGroundsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import PaymentPage from './pages/PaymentPage'

// Components
import Navbar from './components/Navbar'

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" />

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/grounds" element={<GroundsPage />} />
        <Route path="/grounds/:groundId/slots" element={<SlotsPage />} />

        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/grounds" element={
          <ProtectedRoute adminOnly={true}>
            <AdminGroundsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute adminOnly={true}>
            <AdminBookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App