import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">LocalConnect</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/listings">Browse Listings</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/producers">Producers</Link></li>
        <li><Link to="/retailers">Retailers</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/matches">Matches</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
