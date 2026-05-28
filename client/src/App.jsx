import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Producers from './pages/Producers'
import Retailers from './pages/Retailers'
import Products from './pages/Products'
import Listings from './pages/Listings'
import Orders from './pages/Orders'
import Matches from './pages/Matches'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producers" element={<Producers />} />
          <Route path="/retailers" element={<Retailers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/matches" element={<Matches />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
