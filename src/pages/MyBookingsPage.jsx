import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking } from '../services/bookingService'

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings()
      setBookings(response.data)
    } catch (err) {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId)

      // Update status locally without refetching
      setBookings(prev =>
        prev.map(b =>
          b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b
        )
      )
    } catch (err) {
      setError(err.response?.data || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
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
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return styles.confirmed
      case 'Cancelled': return styles.cancelled
      default: return styles.pending
    }
  }

  if (loading) return <div style={styles.center}>Loading bookings...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Bookings</h1>
        <p style={styles.subtitle}>View and manage your bookings</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>You have no bookings yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {bookings.map(booking => (
            <div key={booking.bookingId} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.groundInfo}>
                  <h3 style={styles.groundName}>{booking.groundName}</h3>
                  <span style={styles.groundType}>{booking.groundType}</span>
                </div>

                <div style={styles.timeInfo}>
                  <span>📅 {formatDate(booking.date)}</span>
                  <span>
                    🕐 {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                  </span>
                </div>

                <div style={styles.bookedOn}>
                  Booked on {formatDate(booking.bookingDate)}
                </div>
              </div>

              <div style={styles.cardRight}>
                <span style={getStatusStyle(booking.status)}>
                  {booking.status}
                </span>

                {booking.status === 'Confirmed' && (
                  <button
                    style={{
                      ...styles.cancelButton,
                      opacity: cancellingId === booking.bookingId ? 0.7 : 1
                    }}
                    onClick={() => handleCancel(booking.bookingId)}
                    disabled={cancellingId === booking.bookingId}
                  >
                    {cancellingId === booking.bookingId
                      ? 'Cancelling...'
                      : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '900px',
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
  error: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  cardLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  groundInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.25rem',
  },
  groundName: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
  },
  groundType: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    padding: '0.15rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  timeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    color: '#4a5568',
    fontSize: '0.9rem',
  },
  bookedOn: {
    color: '#a0aec0',
    fontSize: '0.8rem',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  confirmed: {
    backgroundColor: '#f0fff4',
    color: '#276749',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  cancelled: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  pending: {
    backgroundColor: '#fffff0',
    color: '#b7791f',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#c53030',
    border: '1px solid #c53030',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
  },
  emptyText: {
    color: '#718096',
    fontSize: '1.1rem',
  },
  center: {
    textAlign: 'center',
    padding: '4rem',
    color: '#718096',
  }
}

export default MyBookingsPage