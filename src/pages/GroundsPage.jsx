import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllGrounds } from '../services/groundService'

function GroundsPage() {
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchGrounds()
  }, [])

  const fetchGrounds = async () => {
    try {
      const response = await getAllGrounds()
      setGrounds(response.data)
    } catch (err) {
      setError('Failed to load grounds. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={styles.center}>Loading grounds...</div>
  if (error) return <div style={styles.center}>{error}</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Available Grounds</h1>
        <p style={styles.subtitle}>Select a ground to view available slots</p>
      </div>

      {grounds.length === 0 ? (
        <div style={styles.center}>
          No grounds available at the moment.
        </div>
      ) : (
        <div style={styles.grid}>
          {grounds.map(ground => (
            <div key={ground.groundId} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.typeTag}>{ground.type}</span>
              </div>

              <h2 style={styles.groundName}>{ground.name}</h2>
              <p style={styles.description}>{ground.description}</p>

              <div style={styles.cardFooter}>
                <span style={styles.rate}>
                  Rs. {ground.hourlyRate}/hour
                </span>
                <button
                  style={styles.button}
                  onClick={() => navigate(`/grounds/${ground.groundId}/slots`)}
                >
                  View Slots
                </button>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    marginBottom: '1rem',
  },
  typeTag: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  groundName: {
    fontSize: '1.3rem',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  description: {
    color: '#718096',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '1.1rem',
  },
  button: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  center: {
    textAlign: 'center',
    padding: '4rem',
    color: '#718096',
  }
}

export default GroundsPage