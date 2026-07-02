import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAvailableSlotsByDate } from '../services/slotService'
import { createMultipleBookings } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'

function SlotsPage() {
  const { groundId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlotIds, setSelectedSlotIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleDateSearch = async () => {
    if (!selectedDate) return

    setLoading(true)
    setError('')
    setSlots([])
    setSelectedSlotIds([])
    setSearched(false)

    try {
      const response = await getAvailableSlotsByDate(groundId, selectedDate)

      const now = new Date()
      const isToday = selectedDate === today

      const sorted = response.data
        .filter(slot => {
          if (isToday) {
            const slotHour = parseInt(slot.startTime.split(':')[0])
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()
            if (slotHour < currentHour) return false
            if (slotHour === currentHour && currentMinute > 0) return false
            return true
          }
          return true
        })
        .sort((a, b) => {
          const getOrder = (time) => {
            const hour = parseInt(time.split(':')[0])
            return hour >= 17 ? hour : hour - 6
          }
          return getOrder(a.startTime) - getOrder(b.startTime)
        })

      setSlots(sorted)
      setSearched(true)
    } catch (err) {
      setError('Failed to load slots. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSlotSelection = (slotId) => {
    setSelectedSlotIds(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    )
  }

  const handleBookSelected = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (selectedSlotIds.length === 0) return

    setBookingLoading(true)
    setError('')

    try {
      const response = await createMultipleBookings(selectedSlotIds)
      const { bookings, totalAmount, bookingIds } = response.data

      // Navigate to payment with all booking data
      navigate('/payment', {
        state: {
          bookingIds,
          bookings,
          totalAmount,
          isMultiple: true
        }
      })
    } catch (err) {
      setError(err.response?.data || 'Booking failed. Please try again.')
      setBookingLoading(false)
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
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    })
  }

  const selectedSlots = slots.filter(s => selectedSlotIds.includes(s.slotId))
  const totalAmount = selectedSlots.reduce(
    (sum, slot) => sum + (slot.hourlyRate || 0), 0
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/grounds')}>
          ← Back to Grounds
        </button>
        <h1 style={styles.title}>Book a Slot</h1>
        <p style={styles.subtitle}>
          Select a date then tap slots to select them
        </p>
      </div>

      {/* Date Picker */}
      <div style={styles.datePickerCard}>
        <label style={styles.dateLabel}>Select Date</label>
        <div style={styles.datePickerRow}>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setSlots([])
              setSelectedSlotIds([])
              setSearched(false)
            }}
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
            {slots.length > 0 && (
              <p style={styles.selectHint}>
                Tap slots to select them
              </p>
            )}
          </div>

          {slots.length > 0 && (
            <div style={styles.grid}>
              {slots.map(slot => {
                const isSelected = selectedSlotIds.includes(slot.slotId)
                return (
                  <div
                    key={slot.slotId}
                    style={{
                      ...styles.card,
                      ...(isSelected ? styles.cardSelected : {})
                    }}
                    onClick={() => toggleSlotSelection(slot.slotId)}
                  >
                    {/* Selection indicator */}
                    <div style={styles.cardTop}>
                      <span style={styles.groundBadge}>
                        {slot.groundName} — {slot.groundType}
                      </span>
                      <div style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxSelected : {})
                      }}>
                        {isSelected && '✓'}
                      </div>
                    </div>

                    <div style={styles.timeSection}>
                      <span style={styles.timeLabel}>Time</span>
                      <span style={styles.time}>
                        {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                      </span>
                    </div>

                    <div style={styles.cardFooter}>
                      <span style={styles.availableBadge}>Available</span>
                      <span style={styles.slotRate}>
                        Rs. {slot.hourlyRate?.toLocaleString()}/hr
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!searched && !loading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📅</div>
          <p style={styles.emptyText}>
            Pick a date above to see available slots
          </p>
        </div>
      )}

      {/* Sticky booking bar at bottom */}
      {selectedSlotIds.length > 0 && (
        <div style={styles.stickyBar}>
          <div style={styles.stickyInfo}>
            <span style={styles.stickyCount}>
              {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} selected
            </span>
            <span style={styles.stickyTotal}>
              Total: Rs. {selectedSlots
                .reduce((sum, s) => sum + (s.hourlyRate || 0), 0)
                .toLocaleString()}
            </span>
          </div>
          <button
            style={{
              ...styles.bookButton,
              opacity: bookingLoading ? 0.7 : 1
            }}
            onClick={handleBookSelected}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Processing...' : 'Book & Pay'}
          </button>
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
    paddingBottom: '6rem',
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
    marginBottom: '0.25rem',
  },
  selectHint: {
    fontSize: '0.85rem',
    color: '#a0aec0',
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
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.15s ease',
  },
  cardSelected: {
    border: '2px solid #1a1a2e',
    backgroundColor: '#f7fafc',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groundBadge: {
    color: '#2b6cb0',
    backgroundColor: '#ebf8ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  checkbox: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: 'white',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: '#1a1a2e',
    border: '2px solid #1a1a2e',
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
  slotRate: {
    fontWeight: '600',
    color: '#4a5568',
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
  },
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  stickyInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  stickyCount: {
    color: '#a0aec0',
    fontSize: '0.85rem',
  },
  stickyTotal: {
    color: 'white',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  bookButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  }
}

export default SlotsPage