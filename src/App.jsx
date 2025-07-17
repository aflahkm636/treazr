// App.js
import React from 'react';
import RoutesWrapper from './Routeswrapper';
import { AuthProvider } from './common/context/AuthProvider';

function App() {
  return (
   
      <AuthProvider>
        <RoutesWrapper />
      </AuthProvider>
    
  );
}

export default App;