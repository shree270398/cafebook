import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Home from './pages/Home.jsx'
import Cafe from './pages/Cafe.jsx'
import Menu from './pages/Menu.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BookTable from './pages/BookTable.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminBookings from './pages/admin/AdminBookings.jsx'
import AdminTables from './pages/admin/AdminTables.jsx'
import AdminMenu from './pages/admin/AdminMenu.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="cafe" element={<Cafe />} />
          <Route path="menu" element={<Menu />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="book"
            element={
              <ProtectedRoute>
                <BookTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
