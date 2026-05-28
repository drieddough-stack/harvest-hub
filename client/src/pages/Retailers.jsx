import { useState, useEffect } from 'react'
import { retailersApi } from '../api/client'

const Retailers = () => {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true)
        const response = await retailersApi.getAll()
        setRetailers(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching retailers:', err)
        setError('Failed to load retailers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRetailers()
  }, [])

  if (loading) return <div className="loading">Loading retailers...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page retailers-page">
      <h1>Partner Retailers</h1>
      <p>Discover stores, cafes, and markets looking for local products.</p>

      {retailers.length === 0 ? (
        <p>No retailers found.</p>
      ) : (
        <div className="retailers-list">
          {retailers.map((retailer) => (
            <div key={retailer.id} className="retailer-card">
              <div className="retailer-header">
                <h3>{retailer.name}</h3>
                <span className="type-tag">{retailer.type}</span>
              </div>
              <p className="location">📍 {retailer.location}</p>
              <p className="description">{retailer.description}</p>
              <div className="retailer-footer">
                 <button className="btn btn-secondary">Contact Store</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Retailers
