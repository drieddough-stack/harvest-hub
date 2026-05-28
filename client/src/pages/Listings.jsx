import { useState, useEffect } from 'react'
import { listingsApi } from '../api/client'

const Listings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const response = await listingsApi.getAll()
        setListings(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching listings:', err)
        setError('Failed to load listings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  if (loading) return <div className="loading">Loading listings...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page listings-page">
      <h1>Local Product Listings</h1>
      <p>Browse fresh products from local producers.</p>

      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <h3>{listing.product_name}</h3>
              <p className="producer">by {listing.producer_name}</p>
              <p className="price">${listing.price_per_unit.toFixed(2)} / {listing.unit}</p>
              <p className="quantity">Available: {listing.available_quantity} {listing.unit}</p>
              <button className="btn btn-primary">Order Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Listings
