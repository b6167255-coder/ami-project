import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { DashboardRouter } from './pages/DashboardRouter.tsx'
import { TeacherDashboard } from './pages/TeacherDashboard.tsx'
import { NewRequestPage } from './pages/NewRequestPage.tsx'
import { SubstituteDashboard } from './pages/SubstituteDashboard.tsx'
import { AvailabilityPage } from './pages/AvailabilityPage.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/my-requests" element={<TeacherDashboard />} />
          <Route path="/new-request" element={<NewRequestPage />} />
          <Route path="/available-shifts" element={<SubstituteDashboard />} />
          <Route path="/availability" element={<AvailabilityPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
