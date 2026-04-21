import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { StaticInfoProvider } from './context/StaticInfoContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StaticInfoProvider>
          <App />
        </StaticInfoProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
