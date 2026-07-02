import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Book Your Indoor Ground</h1>
        <p style={styles.heroSubtitle}>
          Cricket and Futsal grounds available for booking online
        </p>
        <button
          style={styles.heroButton}
          onClick={() => navigate('/grounds')}
        >
          View Available Grounds
        </button>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>🏏</div>
          <h3 style={styles.featureTitle}>Cricket</h3>
          <p style={styles.featureText}>
            Professional indoor cricket grounds with proper pitch and lighting
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>⚽</div>
          <h3 style={styles.featureTitle}>Futsal</h3>
          <p style={styles.featureText}>
            High quality futsal courts with smooth flooring and goal posts
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>📅</div>
          <h3 style={styles.featureTitle}>Easy Booking</h3>
          <p style={styles.featureText}>
            Book your slot online in minutes, no WhatsApp needed
          </p>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to Play?</h2>
          <p style={styles.ctaText}>
            Create an account to start booking grounds
          </p>
          <div style={styles.ctaButtons}>
            <button
              style={styles.ctaPrimary}
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
            <button
              style={styles.ctaSecondary}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* About Section */}
      <div style={styles.about}>
        <h2 style={styles.aboutTitle}>About Us</h2>
        <p style={styles.aboutText}>
          We provide premium indoor Cricket and Futsal grounds designed for
          players who want a reliable, well-maintained space to play any time
          of day. Our online booking system makes it simple to check
          availability and reserve your slot in seconds — no more back and
          forth on WhatsApp.
        </p>

        <div style={styles.aboutStats}>
          <div style={styles.aboutStat}>
            <span style={styles.aboutStatNumber}>2+</span>
            <span style={styles.aboutStatLabel}>Grounds Available</span>
          </div>
          <div style={styles.aboutStat}>
            <span style={styles.aboutStatNumber}>13</span>
            <span style={styles.aboutStatLabel}>Slots Daily</span>
          </div>
          <div style={styles.aboutStat}>
            <span style={styles.aboutStatNumber}>24/7</span>
            <span style={styles.aboutStatLabel}>Online Booking</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  hero: {
    backgroundColor: '#6a9c61',
    color: 'white',
    textAlign: 'center',
    padding: '5rem 2rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#ffffff',
    marginBottom: '2rem',
  },
  heroButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '0.85rem 2rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    padding: '4rem 2rem',
    flexWrap: 'wrap',
  },
  feature: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
    width: '250px',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.75rem',
    color: '#1a1a2e',
  },
  featureText: {
    color: '#718096',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  cta: {
    backgroundColor: '#346989',
    textAlign: 'center',
    padding: '4rem 2rem',
    borderTop: '1px solid #e2e8f0',
  },
  ctaTitle: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    color: '#1a1a2e',
  },
  ctaText: {
    color: '#718096',
    marginBottom: '2rem',
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  ctaPrimary: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  ctaSecondary: {
    backgroundColor: 'white',
    color: '#1a1a2e',
    border: '2px solid #1a1a2e',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  about: {
    backgroundColor: 'black',
    textAlign: 'center',
    padding: '4rem 2rem',
    borderTop: '1px solid #e2e8f0',
  },
  aboutTitle: {
    fontSize: '2rem',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  aboutText: {
    color: '#ffffff',
    fontSize: '1.2rem',
    lineHeight: '1.8',
    maxWidth: '700px',
    margin: '0 auto 2.5rem auto',
  },
  aboutStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  aboutStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
  },
  aboutStatNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  aboutStatLabel: {
    fontSize: '0.85rem',
    color: '#a0aec0',
  }
}

export default HomePage