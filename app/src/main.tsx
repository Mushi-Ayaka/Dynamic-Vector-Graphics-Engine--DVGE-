import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ManualView } from './components/ManualView'
import { useStore } from './store/useStore'

const isManual = window.location.hash === '#manual'

// Pre-cargar la lista de plugins antes de renderizar para que el store
// tenga `plugins` disponible cuando cualquier proyecto intente cargarse.
useStore.getState().initialize()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isManual ? <ManualView /> : <App />}
  </React.StrictMode>,
)
