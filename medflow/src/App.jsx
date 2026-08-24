import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'

import MarketingLayout from './marketing/MarketingLayout'
import Home from './marketing/Home'
import Products from './marketing/Products'
import HowItWorks from './marketing/HowItWorks'
import Payment from './marketing/Payment'
import Trust from './marketing/Trust'
import Track from './marketing/Track'

import AuthScreen from './pages/AuthScreen'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Compliance from './pages/Compliance'

const TITLES = {
  dashboard: ['Dashboard', 'Overview of your procurement activity'],
  catalog: ['Catalog', 'Products available across the network'],
  inventory: ['Inventory', 'Stock on hand and reorder points'],
  orders: ['Orders', 'Chain of custody for every shipment'],
  payments: ['Invoices', 'Payments owed and received'],
  compliance: ['Compliance', 'Licenses, certificates & regulatory docs'],
}

// The authenticated app kept its existing internal page-switching (rather
// than one route per page) — same dashboard, orders, catalog, inventory,
// invoices, and compliance screens and data as before, just restyled.
function DashboardShell() {
  const { profile } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [title, subtitle] = TITLES[page] || TITLES.dashboard

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <div className="main">
        <TopBar title={title} subtitle={subtitle} />
        {page === 'dashboard' && <Dashboard />}
        {page === 'catalog' && <Catalog />}
        {page === 'inventory' && profile.role !== 'supplier' && <Inventory />}
        {page === 'orders' && <Orders />}
        {page === 'payments' && <Payments />}
        {page === 'compliance' && <Compliance />}
      </div>
    </div>
  )
}

export default function App() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>Loading MEDFLOW…</div>
  }

  return (
    <Routes>
      {/* Public marketing site */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/trust" element={<Trust />} />
        <Route path="/track" element={<Track />} />
      </Route>

      {/* Auth */}
      <Route
        path="/login"
        element={session && profile ? <Navigate to="/clinic/dashboard" replace /> : <AuthScreen />}
      />

      {/* Authenticated app (both clinic and supplier roles land here) */}
      <Route
        path="/clinic/*"
        element={session && profile ? <DashboardShell /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
