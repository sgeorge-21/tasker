import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onRegistered(r) { /* optional: keep reference to SW */ },
})

createRoot(document.getElementById('root')!).render(<App />)
