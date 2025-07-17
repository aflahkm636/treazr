import React from 'react';

import ImageBanner from './Imagebanner';
import ProductList from '../ProductList';

function Landing() {
  return (
    <div className="landing-page">
      <ImageBanner />
      <ProductList />
    </div>
  );
}

export default Landing;