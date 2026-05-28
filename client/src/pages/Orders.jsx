import { useState, useEffect } from 'react'
import { ordersApi, listingsApi, retailersApi } from '../api/client'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [listings, setListings] = useState([])
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    listing_id: '',
    retailer_id: '',
    quantity: 1,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [oResponse, lResponse, rResponse] = await Promise.all([
        ordersApi.getAll(),
        listingsApi.getAll(),
        retailersApi.getAll()
      ])
      setOrders(oResponse.data)
      setListings(lResponse.data)
      setRetailers(rResponse.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.listing_id || !formData.retailer_id) {
      alert('Please select both a product and a retailer.')
      return
    }

    try {
      setSubmitting(true)
      const selectedListing = listings.find(l => l.id === formData.listing_id)
      const payload = {
        ...formData,
        product_id: selectedListing.product_id,
        producer_id: selectedListing.producer_id,
        quantity: parseFloat(formData.quantity),
        total_price: selectedListing.price_per_unit * parseFloat(formData.quantity)
      }
      
      await ordersApi.create(payload)
      setFormData({ listing_id: '', retailer_id: '', quantity: 1, notes: '' })
      fetchData() // Refresh list
      alert('Order placed successfully!')
    } catch (err) {
      console.error('Error creating order:', err)
      alert('Failed to place order: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && orders.length === 0) return <div className="loading">Loading orders...</div>

  return (
    <div className="page orders-page">
      <h1>Order Management</h1>
      
      <section className="order-form-section">
        <h2>Place New Order</h2>
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Select Product Listing</label>
            <select 
              name="listing_id" 
              value={formData.listing_id} 
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a product --</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>
                  {l.product_name} (${l.price_per_unit}/{l.unit}) - {l.producer_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Retailer</label>
            <select 
              name="retailer_id" 
              value={formData.retailer_id} 
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a retailer --</option>
              {retailers.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleInputChange}
              placeholder="Delivery instructions..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </section>

      <section className="orders-list-section">
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Producer</th>
                <th>Retailer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.product_name}</td>
                  <td>{order.producer_name}</td>
                  <td>{order.retailer_name}</td>
                  <td>{order.quantity}</td>
                  <td>${order.total_price.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default Orders
