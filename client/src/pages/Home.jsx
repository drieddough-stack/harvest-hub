import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { producersApi, listingsApi, retailersApi } from '../api/client'

const Home = () => {
  const [stats, setStats] = useState({ producers: 0, listings: 0, retailers: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [p, l, r] = await Promise.all([
          producersApi.getAll(),
          listingsApi.getAll(),
          retailersApi.getAll()
        ])
        setStats({
          producers: p.data.length,
          listings: l.data.length,
          retailers: r.data.length
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Connect with Local Producers</h1>
        <p>LocalConnect bridges the gap between regional farms, artisans, and the retailers who want to stock their goods.</p>
        <div className="cta-buttons">
          <Link to="/listings" className="btn btn-primary">Browse Listings</Link>
          <Link to="/producers" className="btn btn-secondary">Our Producers</Link>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h2>{stats.producers}</h2>
          <p>Active Producers</p>
        </div>
        <div className="stat-card">
          <h2>{stats.listings}</h2>
          <p>Live Listings</p>
        </div>
        <div className="stat-card">
          <h2>{stats.retailers}</h2>
          <p>Partner Retailers</p>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Discover</h3>
            <p>Retailers browse seasonal products from local producers.</p>
          </div>
          <div className="step">
            <h3>2. Match</h3>
            <p>Connect with producers that fit your store's needs.</p>
          </div>
          <div className="step">
            <h3>3. Order</h3>
            <p>Place orders directly and manage the logistics in one place.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
