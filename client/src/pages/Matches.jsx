import { useState, useEffect } from 'react'
import { matchesApi } from '../api/client'

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const response = await matchesApi.getAll()
        setMatches(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError('Failed to load matches.')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  if (loading) return <div className="loading">Loading matches...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page matches-page">
      <h1>Active Matches</h1>
      <p>Successful connections between producers and retailers.</p>

      {matches.length === 0 ? (
        <p>No matches found yet. Matches are created automatically after the first order between a producer and retailer.</p>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-participants">
                <div className="participant">
                  <span className="label">Producer</span>
                  <h3>{match.producer_name}</h3>
                </div>
                <div className="match-divider">↔</div>
                <div className="participant">
                  <span className="label">Retailer</span>
                  <h3>{match.retailer_name}</h3>
                </div>
              </div>
              <div className="match-stats">
                <div className="match-stat">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{match.total_orders}</span>
                </div>
                <div className="match-stat">
                  <span className="stat-label">GMV</span>
                  <span className="stat-value">${match.total_gmv.toFixed(2)}</span>
                </div>
                <div className="match-stat">
                  <span className="stat-label">Since</span>
                  <span className="stat-value">{new Date(match.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="match-actions">
                <button className="btn btn-secondary">View History</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Matches
