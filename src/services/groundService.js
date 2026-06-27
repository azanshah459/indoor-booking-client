import api from './api'

export const getAllGrounds = () => api.get('/grounds')
export const getGroundById = (id) => api.get(`/grounds/${id}`)
export const createGround = (data) => api.post('/grounds', data)
export const updateGround = (id, data) => api.put(`/grounds/${id}`, data)
export const deleteGround = (id) => api.delete(`/grounds/${id}`)