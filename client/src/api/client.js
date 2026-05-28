import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const producersApi = {
  getAll: (params) => apiClient.get('/producers', { params }),
  getById: (id) => apiClient.get(`/producers/${id}`),
  create: (data) => apiClient.post('/producers', data),
  update: (id, data) => apiClient.put(`/producers/${id}`, data),
  delete: (id) => apiClient.delete(`/producers/${id}`),
}

export const retailersApi = {
  getAll: (params) => apiClient.get('/retailers', { params }),
  getById: (id) => apiClient.get(`/retailers/${id}`),
  create: (data) => apiClient.post('/retailers', data),
  update: (id, data) => apiClient.put(`/retailers/${id}`, data),
  delete: (id) => apiClient.delete(`/retailers/${id}`),
}

export const productsApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
}

export const listingsApi = {
  getAll: (params) => apiClient.get('/listings', { params }),
  getById: (id) => apiClient.get(`/listings/${id}`),
  create: (data) => apiClient.post('/listings', data),
  update: (id, data) => apiClient.put(`/listings/${id}`, data),
  delete: (id) => apiClient.delete(`/listings/${id}`),
}

export const ordersApi = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
}

export const matchesApi = {
  getAll: (params) => apiClient.get('/matches', { params }),
  getById: (id) => apiClient.get(`/matches/${id}`),
}

export default apiClient
