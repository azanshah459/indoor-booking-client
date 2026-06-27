import { useState, useEffect } from 'react'
import { getAllBookings } from '../services/bookingService'

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings()
      setBookings(response.data)
    } catch (err) {
      console.error('Failed to load bookings')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filtered = filter === 'All'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) return <div style={styles.center}>Loading bookings...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>All Bookings</h1>
          <p style={styles.subtitle}>{bookings.length} total bookings</p>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          {['All', 'Confirmed', 'Cancelled'].map(status => (
            <button
              key={status}
              style={{
                ...styles.filterBtn,
                ...(filter === status ? styles.filterBtnActive : {})
              }}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>No {filter !== 'All' ? filter.toLowerCase() : ''} bookings found.</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Ground</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Booked On</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => (
                <tr key={booking.bookingId} style={styles.tr}>
                  <td style={styles.td}>{booking.bookingId}</td>
                  <td style={styles.td}>{booking.customerName}</td>
                  <td style={styles.td}>
                    {booking.groundName}
                    <span style={styles.groundType}>{booking.groundType}</span>
                  </td>
                  <td style={styles.td}>{formatDate(booking.date)}</td>
                  <td style={styles.td}>
                    {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                  </td>
                  <td style={styles.td}>{formatDate(booking.bookingDate)}</td>
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
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#718096',
  },
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    backgroundColor: 'white',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    padding: '0.5rem 1.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  filterBtnActive: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: '1px solid #1a1a2e',
  },
  tableWrapper: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    backgroundColor: '#f7fafc',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.9rem',
    color: '#4a5568',
    verticalAlign: 'middle',
  },
  groundType: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#a0aec0',
    marginTop: '0.15rem',
  },
  confirmed: {
    backgroundColor: '#f0fff4',
    color: '#276749',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  cancelled: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#a0aec0',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  center: {
    textAlign: 'center',
    padding: '4rem',
    color: '#718096',
  }
}

export default AdminBookingsPage