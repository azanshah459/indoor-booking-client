import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, todayRes, revenueRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings/today'),
        api.get('/admin/revenue/monthly')
      ])

      setStats(dashboardRes.data)
      setTodayBookings(todayRes.data)
      setMonthlyRevenue(revenueRes.data)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  if (loading) return <div style={styles.center}>Loading dashboard...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Overview of your indoor facility</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <div style={styles.statValue}>{stats.totalBookings}</div>
            <div style={styles.statLabel}>Total Bookings</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statValue}>{stats.activeBookings}</div>
            <div style={styles.statLabel}>Active Bookings</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statValue}>{stats.todayBookings}</div>
            <div style={styles.statLabel}>Today's Bookings</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div style={styles.statValue}>{stats.cancelledBookings}</div>
            <div style={styles.statLabel}>Cancelled</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏟️</div>
            <div style={styles.statValue}>{stats.totalGrounds}</div>
            <div style={styles.statLabel}>Total Grounds</div>
          </div>

          <div style={{...styles.statCard, ...styles.revenueCard}}>
            <div style={styles.statIcon}>💰</div>
            <div style={{...styles.statValue, color: 'white'}}>
              Rs. {stats.monthlyRevenue.toLocaleString()}
            </div>
            <div style={{...styles.statLabel, color: '#c6f6d5'}}>
              This Month's Revenue
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsRow}>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/admin/grounds')}
          >
            🏟️ Manage Grounds
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/admin/bookings')}
          >
            📋 View All Bookings
          </button>
        </div>
      </div>

      {/* Today's Bookings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Today's Bookings</h2>
        {todayBookings.length === 0 ? (
          <div style={styles.emptySection}>No bookings today yet.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Ground</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map(booking => (
                  <tr key={booking.bookingId} style={styles.tr}>
                    <td style={styles.td}>{booking.customerName}</td>
                    <td style={styles.td}>{booking.groundName}</td>
                    <td style={styles.td}>{booking.groundType}</td>
                    <td style={styles.td}>
                      {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                    </td>
                    <td style={styles.td}>
                      <span style={
                        booking.status === 'Confirmed'
                          ? styles.confirmed
                          : styles.cancelled
                      }>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Revenue */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Monthly Revenue</h2>
        {monthlyRevenue.length === 0 ? (
          <div style={styles.emptySection}>No revenue data yet.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Year</th>
                  <th style={styles.th}>Total Bookings</th>
                  <th style={styles.th}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((item, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{getMonthName(item.month)}</td>
                    <td style={styles.td}>{item.year}</td>
                    <td style={styles.td}>{item.totalBookings}</td>
                    <td style={styles.td}>
                      Rs. {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#718096',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: '#276749',
  },
  statIcon: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  statLabel: {
    color: '#718096',
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#1a1a2e',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
  },
  actionsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  tableWrapper: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f7fafc',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.9rem',
    color: '#4a5568',
  },
  confirmed: {
    backgroundColor: '#f0fff4',
    color: '#276749',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  cancelled: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  emptySection: {
    color: '#a0aec0',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
    padding: '4rem',
    color: '#718096',
  }
}

export default AdminDashboardPage