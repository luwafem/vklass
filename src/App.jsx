import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderDetail from './pages/OrderDetail'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import TicketDetail from './pages/TicketDetail'

// 🏪 NEW: Supplier Storefront (public)
import SupplierStorefront from './pages/SupplierStorefront'

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard'

// Supplier pages
import SupplierDashboard from './pages/supplier/Dashboard'
import SupplierProducts from './pages/supplier/Products'
import AddProduct from './pages/supplier/AddProduct'
import EditProduct from './pages/supplier/EditProduct'
import Inventory from './pages/supplier/Inventory'
import SupplierOrders from './pages/supplier/Orders'
import SupplierPayouts from './pages/supplier/Payouts'
import BankDetails from './pages/supplier/BankDetails'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminOrders from './pages/admin/Orders'
import AdminPayouts from './pages/admin/Payouts'
import AdminLogs from './pages/admin/Logs'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/support/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

        {/* 🏪 Supplier Storefront - Public (no auth required) */}
        <Route path="/store/:supplierId" element={<SupplierStorefront />} />
        <Route path="/store/slug/:storeSlug" element={<SupplierStorefront />} />

        {/* Customer */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>
        } />

        {/* Supplier */}
        <Route path="/supplier/dashboard" element={
          <ProtectedRoute role="supplier"><SupplierDashboard /></ProtectedRoute>
        } />
        <Route path="/supplier/products" element={
          <ProtectedRoute role="supplier"><SupplierProducts /></ProtectedRoute>
        } />
        <Route path="/supplier/products/new" element={
          <ProtectedRoute role="supplier"><AddProduct /></ProtectedRoute>
        } />
        <Route path="/supplier/products/:id/edit" element={
          <ProtectedRoute role="supplier"><EditProduct /></ProtectedRoute>
        } />
        <Route path="/supplier/products/:id/items" element={
          <ProtectedRoute role="supplier"><Inventory /></ProtectedRoute>
        } />
        <Route path="/supplier/orders" element={
          <ProtectedRoute role="supplier"><SupplierOrders /></ProtectedRoute>
        } />
        <Route path="/supplier/payouts" element={
          <ProtectedRoute role="supplier"><SupplierPayouts /></ProtectedRoute>
        } />
        <Route path="/supplier/bank" element={
          <ProtectedRoute role="supplier"><BankDetails /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>
        } />
        <Route path="/admin/payouts" element={
          <ProtectedRoute role="admin"><AdminPayouts /></ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute role="admin"><AdminLogs /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}