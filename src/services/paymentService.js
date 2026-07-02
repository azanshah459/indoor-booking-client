import api from './api'

export const createPaymentIntent = (bookingId) =>
  api.post('/payment/create-intent', { bookingId })

export const createMultiPaymentIntent = (bookingIds) =>
  api.post('/payment/create-multi-intent', bookingIds)

export const confirmPayment = (bookingIds, paymentIntentId) =>
  api.post('/payment/confirm', { bookingIds, paymentIntentId })