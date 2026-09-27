import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import Home from './pages/Home.tsx'
import Landing from './pages/Landing.tsx'
import Privacy from './pages/Privacy.tsx'
import Profile from './pages/Profile.tsx'
import Terms from './pages/Terms.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<Landing />} />
          <Route element={<App />}>
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
