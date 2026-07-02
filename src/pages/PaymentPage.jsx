import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'
import { createPaymentIntent, createMultiPaymentIntent, confirmPayment } from '../services/paymentService'

// Payment Form Component — inside Elements provider
function CheckoutForm({ bookings, totalAmount, bookingIds, clientSecret }) {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()

    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const calculateTimeLeft = () => {
    const heldUntil = bookings[0]?.heldUntil
    if (!heldUntil) return 180 // fallback if not available

    const expiryTime = new Date(heldUntil).getTime()
    const now = new Date().getTime()
    const secondsLeft = Math.floor((expiryTime - now) / 1000)

    return secondsLeft > 0 ? secondsLeft : 0
  }
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft()) // 3 minutes in seconds
    const [expired, setExpired] = useState(timeLeft <= 0)

    const formatTimeLeft = () => {
            const minutes = Math.floor(timeLeft / 60)
            const seconds = timeLeft % 60
            return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    useEffect(() => {
            if (timeLeft <= 0) {
                setExpired(true)
                return
            }

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setExpired(true)
                        return 0
                    }
                return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
    }, [timeLeft])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setProcessing(true)
        setError('')

        const cardElement = elements.getElement(CardElement)

        // Confirm payment with Stripe
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: cardElement,
                }
            }
        )

        if (stripeError) {
            setError(stripeError.message || 'Payment failed.')
            setProcessing(false)
            return
        }

        if (paymentIntent.status === 'succeeded') {
            try {
                // Tell our backend to confirm the booking(s)
                await confirmPayment(bookingIds, paymentIntent.id)
                setSuccess(true)
            } catch (err) {
                setError('Payment succeeded but booking confirmation failed. Contact support.')
            }
        }
        setProcessing(false)
    }

    if (expired) {
        return (
            <div style={styles.expiredBox}>
                <div style={styles.expiredIcon}>⏰</div>
                <h2 style={styles.expiredTitle}>Time Expired</h2>
                <p style={styles.expiredText}>
                    Your slot hold has expired. Please select your slots again.
                </p>
                <button
                    style={styles.successButton}
                    onClick={() => navigate(-2)}
                >
                    Back to Slots
                </button>
            </div>
        )
    }

    if (success) {
        return (
            <div style={styles.successBox}>
                <div style={styles.successIcon}>✅</div>
                <h2 style={styles.successTitle}>Payment Successful!</h2>
                <p style={styles.successText}>
                    {bookings.length > 1
                        ? `Your ${bookings.length} bookings are now confirmed.`
                        : `Your booking for ${bookings[0]?.groundName} is now confirmed.`}
                </p>
                <button
                    style={styles.successButton}
                    onClick={() => navigate('/my-bookings')}
                >
                    View My Bookings
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Countdown Timer */}
            <div style={{
                ...styles.timerBox,
                ...(timeLeft <= 30 ? styles.timerUrgent : {})
            }}>
                ⏱️ Complete payment within <strong>{formatTimeLeft()}</strong>
            </div>
            {/* Booking Summary */}
            <div style={styles.summary}>
                <h3 style={styles.summaryTitle}>Booking Summary</h3>
                {bookings.map((b, index) => (
                    <div key={index} style={styles.summaryItem}>
                        <div style={styles.summaryRow}>
                            <span>{b.groundName}</span>
                            <span>Rs. {b.hourlyRate?.toLocaleString()}</span>
                        </div>
                        <div style={styles.summarySubRow}>
                            {formatTime(b.startTime)} — {formatTime(b.endTime)}
                        </div>
                    </div>
                ))}
                <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                    <span>Total Amount</span>
                    <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Card Input */}
            <div style={styles.cardSection}>
                <label style={styles.cardLabel}>Card Details</label>
                <div style={styles.cardElementWrapper}>
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#1a1a2e',
                                '::placeholder': { color: '#a0aec0' }
                            }
                        }
                    }} />
                </div>

                {/* Test card hint */}
                <div style={styles.testHint}>
                    🧪 Test card: <strong>4242 4242 4242 4242</strong> |
                    Any future date | Any 3-digit CVC
                </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
                type="submit"
                style={{
                    ...styles.payButton,
                    opacity: processing || !stripe ? 0.7 : 1
                }}
                disabled={processing || !stripe}
            >
                {processing
                    ? 'Processing...'
                    : `Pay Rs. ${totalAmount.toLocaleString()}`}
            </button>
        </form>
    )
}

// Helper outside component to avoid re-creation
function formatTime(time) {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
}

// Main Payment Page Component
function PaymentPage() {
    const location = useLocation()
    const navigate = useNavigate()

    // Support BOTH single booking (older flow) and multiple bookings (current flow)
    const singleBooking = location.state?.booking
    const bookings = location.state?.bookings || (singleBooking ? [singleBooking] : [])
    const totalAmount = location.state?.totalAmount || singleBooking?.hourlyRate || 0
    const bookingIds = location.state?.bookingIds || (singleBooking ? [singleBooking.bookingId] : [])
    const isMultiple = location.state?.isMultiple || false

    const [clientSecret, setClientSecret] = useState('')
    const [publishableKey, setPublishableKey] = useState('')
    const [stripePromise, setStripePromise] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        // Check the bookings array, not the old singular "booking"
        if (!bookings || bookings.length === 0) {
            navigate('/')
            return
        }
        fetchPaymentIntent()
    }, [])

    const fetchPaymentIntent = async () => {
        try {
            let response

            if (isMultiple) {
                response = await createMultiPaymentIntent(bookingIds)
            } else {
                response = await createPaymentIntent(bookingIds[0])
            }

            const { clientSecret, publishableKey } = response.data

            setClientSecret(clientSecret)
            setPublishableKey(publishableKey)
            setStripePromise(loadStripe(publishableKey))
        } catch (err) {
            console.error('fetchPaymentIntent error:', err)
            console.error('error response:', err.response?.data)
            setError(err.response?.data || 'Failed to initialize payment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={styles.center}>Setting up payment...</div>
    if (error) return <div style={styles.center}>{error}</div>
    if (!bookings || bookings.length === 0) return null

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Complete Payment</h1>
                    <p style={styles.subtitle}>Secure payment powered by Stripe</p>
                </div>

                {stripePromise && clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            bookings={bookings}
                            totalAmount={totalAmount}
                            bookingIds={bookingIds}
                            clientSecret={clientSecret}
                        />
                    </Elements>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        height: 'fit-content',
    },
    header: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        fontSize: '1.5rem',
        color: '#1a1a2e',
        marginBottom: '0.25rem',
    },
    subtitle: {
        color: '#718096',
        fontSize: '0.9rem',
    },
    summary: {
        backgroundColor: '#f7fafc',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '1.5rem',
    },
    summaryItem: {
        marginBottom: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    summarySubRow: {
        fontSize: '0.8rem',
        color: '#a0aec0',
        marginTop: '0.2rem',
    },
    summaryTitle: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: '0.75rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.88rem',
        color: '#4a5568',
        marginBottom: '0.4rem',
    },
    totalRow: {
        borderTop: '1px solid #e2e8f0',
        paddingTop: '0.5rem',
        marginTop: '0.5rem',
        fontWeight: '700',
        fontSize: '1rem',
        color: '#1a1a2e',
    },
    cardSection: {
        marginBottom: '1.5rem',
    },
    cardLabel: {
        display: 'block',
        fontWeight: '500',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
        color: '#4a5568',
    },
    cardElementWrapper: {
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: '0.75rem',
        backgroundColor: 'white',
    },
    testHint: {
        marginTop: '0.5rem',
        fontSize: '0.8rem',
        color: '#718096',
        backgroundColor: '#fffff0',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        border: '1px solid #fefcbf',
    },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    },
    payButton: {
        width: '100%',
        padding: '0.85rem',
        backgroundColor: '#276749',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    successBox: {
        textAlign: 'center',
        padding: '2rem 1rem',
    },
    successIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    successTitle: {
        fontSize: '1.5rem',
        color: '#276749',
        marginBottom: '0.5rem',
    },
    successText: {
        color: '#718096',
        marginBottom: '1.5rem',
    },
    successButton: {
        backgroundColor: '#1a1a2e',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    center: {
        textAlign: 'center',
        padding: '4rem',
        color: '#718096',
    },
    timerBox: {
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0',
        padding: '0.65rem 1rem',
        borderRadius: '4px',
        marginBottom: '1.25rem',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    timerUrgent: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
    },
    expiredBox: {
        textAlign: 'center',
        padding: '2rem 1rem',
    },
    expiredIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    expiredTitle: {
        fontSize: '1.5rem',
        color: '#c53030',
        marginBottom: '0.5rem',
    },
    expiredText: {
        color: '#718096',
        marginBottom: '1.5rem',
    },
}

export default PaymentPage