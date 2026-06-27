import api from './api'

export const getAvailableSlots = (groundId) => 
  api.get(`/slots/ground/${groundId}/available`)
export const getAllSlotsByGround = (groundId) => 
  api.get(`/slots/ground/${groundId}`)
export const getAvailableSlotsByDate = (groundId, date) =>
  api.get(`/slots/ground/${groundId}/available?date=${date}`)
export const createSlot = (data) => api.post('/slots', data)
export const deleteSlot = (id) => api.delete(`/slots/${id}`)