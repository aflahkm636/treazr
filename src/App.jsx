import React from 'react'
import { Route, Router, Routes, useLocation } from 'react-router-dom'
import Home from './components/landing/Landing'
import Register from './components/Register';
import Login from './components/Login';
import NavBar from './components/Navbar';
import ErrorResponse from './components/Errorresponse';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavBar />}
      <main>
        <Routes>
         <Route path='/' element={<Home/>}/>
         <Route path='/register' element={<Register/>}/>
         <Route path='/login' element={<Login/>}/>
         <Route path='/*' element={<ErrorResponse/>} />
        </Routes>
      </main>
    </>
  );
}
export default App

