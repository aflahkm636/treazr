import React from 'react'
import { Route, Router, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Register from './components/Auth/Register';
import { Navbar } from 'react-bootstrap';
import Login from './components/Auth/Login';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
         <Route path='/' element={<Home/>}/>
         <Route path='/register' element={<Register/>}/>
         <Route path='/login' element={<Login/>}/>
         
        </Routes>
      </main>
    </>
  );
}
export default App

