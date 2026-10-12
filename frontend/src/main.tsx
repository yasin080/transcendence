import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import DashboardLayout from './layouts/DashboardLayout.tsx'
import Lobby from './pages/Lobby.tsx'
import WaitingRoom from './pages/WaitingRoom.tsx'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import RequireAuth from './auth/RequireAuth.tsx'
import Health from './pages/Health.tsx'
import Landing from './pages/Landing.tsx'
import Privacy from './pages/Privacy.tsx'
import Profile from './pages/Profile.tsx'
import Terms from './pages/Terms.tsx'
import Leaderboard from './pages/Leaderboard.tsx'

const Game = lazy(() => import('./pages/Game.tsx'))

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* MARCO 1 — landing, login, legal */}
          <Route index element={<Landing />} />
          <Route element={<App />}>
            {/* Antes la raíz mostraba la salud de las conexiones; ahora tiene ruta propia */}
            <Route path="health" element={<Health />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          <Route element={<RequireAuth />}>
            {/* MARCO 2 — dashboard */}
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<Lobby />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="waiting-room/:roomId" element={<WaitingRoom />} />
            </Route>

            {/* MARCO 3 — juego a pantalla completa */}
            <Route
              path="game/:gameId"
              element={
                <Suspense fallback={<div className="h-screen bg-void" />}>
                  <Game />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
