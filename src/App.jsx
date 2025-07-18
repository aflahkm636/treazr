// App.js
import React from 'react';
import RoutesWrapper from './Routeswrapper';
import { AuthProvider } from './common/context/AuthProvider';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
   <>
         <ToastContainer position="top-center" autoClose={3000} />

     <AuthProvider>
        <RoutesWrapper />
      </AuthProvider>
   </>
    
    
  );
}

export default App;