import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import DashboardLayout from './layouts/DashboardLayout.tsx'
import Lobby from './pages/Lobby.tsx'
import './index.css'
import App from './App.tsx'
import Health from './pages/Health.tsx'
import Privacy from './pages/Privacy.tsx'
import Terms from './pages/Terms.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* MARCO 1 — landing, login, legal.*/

            <Route element={<App />}>
              {/* <Route index element={<Landing />} /> */}
              <Route path="health" element={<Health />} /> {/* Antes la raiz mostraba la salud de las conexiones, propia ruta */}
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
            </Route>
        }

        {/* MARCO 2 — DASHBOARD */}
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Lobby />} />
        </Route>

        {/* MARCO 3 — Juego Pantalla completa */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
