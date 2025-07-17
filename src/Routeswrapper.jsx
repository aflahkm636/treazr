// components/RoutesWrapper.js
import { Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/landing/Landing';
import Products from './pages/Products';
import ErrorResponse from './components/Errorresponse';
import Login from './components/Login'
import Register from './components/Register'
import NavBar2 from './components/Navbar2';


const RoutesWrapper = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavBar2 />}
      <main>
        <Routes>

          <Route path='/' element={<Landing />} />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/*' element={<ErrorResponse />} />
          <Route path='/products' element={<Products />} />
        </Routes>
      </main>
    </>
  );
};

export default RoutesWrapper;