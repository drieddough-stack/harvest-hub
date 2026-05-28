import { useState, useEffect } from 'react'
import { productsApi } from '../api/client'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productsApi.getAll()
        setProducts(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div className="loading">Loading products...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="page products-page">
      <h1>Regional Products</h1>
      <p>Browse the diverse range of goods offered by our local producers.</p>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="category-tag">{product.category}</span>
                <p className="producer-name">Producer: {product.producer_name}</p>
                <p className="description">{product.description}</p>
                <p className="unit-info">Sold by: {product.unit}</p>
              </div>
              <div className="product-actions">
                <button className="btn btn-secondary">View Listings</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
