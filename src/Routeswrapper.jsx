// components/RoutesWrapper.js
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

import Wishlist from './pages/Wishlist';
import Landing from './pages/landing/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import ErrorResponse from './pages/Errorresponse';
import NavBar2 from './common/layout/Navbar2';
import { useAuth } from './common/context/AuthProvider';
import TopRated from './pages/landing/Toprated';
import Newest from './pages/landing/Newest';
import ProductDetails from './common/components/ProductDetails';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoutesWrapper = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavBar2 />}
      <main>
        <Routes>
          <Route path='/' element={<Landing />} >
          <Route index element={<TopRated/>}/>
          <Route path='/top-rated' element={<TopRated/>}/>
          <Route path='/newest' element={<Newest/>}/>
          </Route>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/products' element={<Products />} />
          <Route path='/productdetails:id' element={<ProductDetails/>}/>
          <Route
            path='/wishlist'
            element={
              <ProtectedRoute>
                <Wishlist/>
              </ProtectedRoute>
            }
          />
          <Route path='/*' element={<ErrorResponse />} />
        </Routes>
      </main>
    </>
  );
};

export default RoutesWrapper;