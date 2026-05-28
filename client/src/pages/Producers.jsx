import { useState, useEffect } from 'react'
import { producersApi } from '../api/client'

const Producers = () => {
  const [producers, setProducers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducers = async () => {
      try {
        setLoading(true)
        const response = await producersApi.getAll()
        setProducers(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching producers:', err)
        setError('Failed to load producers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducers()
  }, [])

  if (loading) return <div className="loading">Loading producers...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page producers-page">
      <h1>Our Local Producers</h1>
      <p>Meet the people behind your food and goods.</p>

      {producers.length === 0 ? (
        <p>No producers found.</p>
      ) : (
        <div className="producers-list">
          {producers.map((producer) => (
            <div key={producer.id} className="producer-card">
              <h3>{producer.name}</h3>
              <p className="type">{producer.type.charAt(0).toUpperCase() + producer.type.slice(1)}</p>
              <p className="location">📍 {producer.location}</p>
              <p className="description">{producer.description}</p>
              <button className="btn btn-secondary">View Profile</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Producers
