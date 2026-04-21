import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ManualView } from './components/ManualView'

const isManual = window.location.hash === '#manual'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isManual ? <ManualView /> : <App />}
  </React.StrictMode>,
)
