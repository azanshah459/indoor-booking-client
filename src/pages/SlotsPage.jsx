import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAvailableSlotsByDate } from '../services/slotService'
import { createBooking } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'

function SlotsPage() {
  const { groundId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [bookingSlotId, setBookingSlotId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleDateSearch = async () => {
    if (!selectedDate) return

    setLoading(true)
    setError('')
    setSuccessMessage('')
    setSlots([])
    setSearched(false)

    try {
      const response = await getAvailableSlotsByDate(groundId, selectedDate)
      const sorted = response.data.sort((a, b) => {
        const getOrder = (time) => {
        const hour = parseInt(time.split(':')[0])
        // Hours 0-5 come first (midnight-6AM), then 17-23 (5PM-midnight)
        return hour >= 17 ? hour : hour - 6
        }
    return getOrder(a.startTime) - getOrder(b.startTime)
    })
      setSlots(response.data)
      setSearched(true)
    } catch (err) {
      setError('Failed to load slots. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slotId) => {
    if (!user) {
      navigate('/login')
      return
    }

    setBookingSlotId(slotId)
    setError('')
    setSuccessMessage('')

    try {
      await createBooking({ slotId })
      setSuccessMessage('Slot booked successfully!')
      setSlots(prev => prev.filter(s => s.slotId !== slotId))
    } catch (err) {
      setError(err.response?.data || 'Booking failed. Please try again.')
    } finally {
      setBookingSlotId(null)
    }
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/grounds')}>
          ← Back to Grounds
        </button>
        <h1 style={styles.title}>Book a Slot</h1>
        <p style={styles.subtitle}>Select a date to see available slots</p>
      </div>

      {/* Date Picker */}
      <div style={styles.datePickerCard}>
        <label style={styles.dateLabel}>Select Date</label>
        <div style={styles.datePickerRow}>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <button
            style={{
              ...styles.searchButton,
              opacity: !selectedDate || loading ? 0.6 : 1
            }}
            onClick={handleDateSearch}
            disabled={!selectedDate || loading}
          >
            {loading ? 'Searching...' : 'Search Slots'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div style={styles.success}>
          ✅ {successMessage}
          <button
            style={styles.viewBookingsBtn}
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </button>
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Results */}
      {searched && !loading && (
        <>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              {slots.length > 0
                ? `${slots.length} slot${slots.length > 1 ? 's' : ''} available on ${formatDateDisplay(selectedDate)}`
                : `No available slots on ${formatDateDisplay(selectedDate)}`
              }
            </h2>
          </div>

          {slots.length > 0 && (
            <div style={styles.grid}>
              {slots.map(slot => (
                <div key={slot.slotId} style={styles.card}>
                  <div style={styles.groundBadge}>
                    {slot.groundName} — {slot.groundType}
                  </div>

                  <div style={styles.timeSection}>
                    <span style={styles.timeLabel}>Time</span>
                    <span style={styles.time}>
                      {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                    </span>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.availableBadge}>Available</span>
                    <button
                      style={{
                        ...styles.bookButton,
                        opacity: bookingSlotId === slot.slotId ? 0.7 : 1
                      }}
                      onClick={() => handleBook(slot.slotId)}
                      disabled={bookingSlotId === slot.slotId}
                    >
                      {bookingSlotId === slot.slotId ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Initial state - nothing searched yet */}
      {!searched && !loading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📅</div>
          <p style={styles.emptyText}>
            Pick a date above to see available slots
          </p>
        </div>
      )}

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
  backButton: {
    background: 'none',
    border: 'none',
    color: '#718096',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    padding: '0',
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#718096',
  },
  datePickerCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  dateLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#1a1a2e',
  },
  datePickerRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  dateInput: {
    padding: '0.65rem 1rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer',
  },
  searchButton: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    padding: '0.65rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  success: {
    backgroundColor: '#f0fff4',
    color: '#276749',
    padding: '1rem 1.5rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewBookingsBtn: {
    backgroundColor: '#276749',
    color: 'white',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  resultsHeader: {
    marginBottom: '1.25rem',
  },
  resultsTitle: {
    fontSize: '1.1rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  groundBadge: {
    color: '#2b6cb0',
    backgroundColor: '#ebf8ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  timeLabel: {
    fontSize: '0.8rem',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  time: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableBadge: {
    color: '#276749',
    backgroundColor: '#f0fff4',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: '#a0aec0',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.1rem',
  }
}

export default SlotsPage