import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import NavBar from './components/Navbar.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom'
import NavBar2 from './Navbar2.jsx'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>

    <App />
    </BrowserRouter>
  </StrictMode>,
)
