import { useState, useEffect } from 'react'
import {
  getAllGrounds,
  createGround,
  deleteGround
} from '../services/groundService'

function AdminGroundsPage() {
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'Futsal',
    description: '',
    hourlyRate: ''
  })

  useEffect(() => {
    fetchGrounds()
  }, [])

  const fetchGrounds = async () => {
    try {
      const response = await getAllGrounds()
      setGrounds(response.data)
    } catch (err) {
      setError('Failed to load grounds.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await createGround({
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate)
      })

      setGrounds(prev => [...prev, response.data])
      setSuccess(`Ground "${response.data.name}" created successfully.`)
      setFormData({ name: '', type: 'Futsal', description: '', hourlyRate: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data || 'Failed to create ground.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (groundId, groundName) => {
    if (!window.confirm(`Delete "${groundName}"? This cannot be undone.`)) return

    setDeletingId(groundId)
    setError('')
    setSuccess('')

    try {
      await deleteGround(groundId)
      setGrounds(prev => prev.filter(g => g.groundId !== groundId))
      setSuccess(`Ground "${groundName}" deleted successfully.`)
    } catch (err) {
      setError(err.response?.data || 'Failed to delete ground.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div style={styles.center}>Loading grounds...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Grounds</h1>
          <p style={styles.subtitle}>Add or remove grounds from your facility</p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => {
            setShowForm(!showForm)
            setError('')
            setSuccess('')
          }}
        >
          {showForm ? 'Cancel' : '+ Add Ground'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Add Ground Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>New Ground</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Ground Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Ground A"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="Futsal">Futsal</option>
                  <option value="Cricket">Cricket</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Hourly Rate (Rs.)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 2000"
                  required
                />
              </div>

              <div style={{...styles.field, gridColumn: '1 / -1'}}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{...styles.input, height: '80px', resize: 'vertical'}}
                  placeholder="Brief description of the ground"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: formLoading ? 0.7 : 1
              }}
              disabled={formLoading}
            >
              {formLoading ? 'Creating...' : 'Create Ground'}
            </button>
          </form>
        </div>
      )}

      {/* Grounds List */}
      {grounds.length === 0 ? (
        <div style={styles.empty}>No grounds added yet.</div>
      ) : (
        <div style={styles.grid}>
          {grounds.map(ground => (
            <div key={ground.groundId} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.typeTag}>{ground.type}</span>
                <button
                  style={{
                    ...styles.deleteButton,
                    opacity: deletingId === ground.groundId ? 0.6 : 1
                  }}
                  onClick={() => handleDelete(ground.groundId, ground.name)}
                  disabled={deletingId === ground.groundId}
                >
                  {deletingId === ground.groundId ? '...' : '🗑️'}
                </button>
              </div>

              <h3 style={styles.groundName}>{ground.name}</h3>
              <p style={styles.description}>{ground.description}</p>

              <div style={styles.cardBottom}>
                <span style={styles.rate}>Rs. {ground.hourlyRate}/hr</span>
                <span style={styles.groundId}>ID: {ground.groundId}</span>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addButton: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    padding: '0.7rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  success: {
    backgroundColor: '#f0fff4',
    color: '#276749',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.2rem',
    color: '#1a1a2e',
    marginBottom: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontWeight: '500',
    fontSize: '0.9rem',
    color: '#4a5568',
  },
  input: {
    padding: '0.65rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  submitButton: {
    backgroundColor: '#276749',
    color: 'white',
    border: 'none',
    padding: '0.7rem 2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  typeTag: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    padding: '0.2rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0.2rem',
  },
  groundName: {
    fontSize: '1.15rem',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  description: {
    color: '#718096',
    fontSize: '0.88rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  groundId: {
    color: '#a0aec0',
    fontSize: '0.8rem',
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

export default AdminGroundsPage