import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

document.documentElement.dataset.appBuild =
  import.meta.env.VITE_BUILD_ID ?? 'dev-local'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
