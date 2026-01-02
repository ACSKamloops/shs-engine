import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { DensityProvider } from './contexts/DensityContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DensityProvider>
      <App />
    </DensityProvider>
  </React.StrictMode>,
)