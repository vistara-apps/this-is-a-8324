import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CreateAd from './pages/CreateAd'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import PricingPage from './pages/PricingPage'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="create" element={<CreateAd />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}

export default App