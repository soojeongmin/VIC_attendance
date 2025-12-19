import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AttendancePage from './pages/AttendancePage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/attendance/:grade/:zoneId" element={<AttendancePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
