import React from 'react';

import ImageBanner from './Imagebanner';
import ProductList from '../ProductList';
import Banner from './Banner';
import TopRated from './Toprated';
import Newest from './Newest';
import LandingNav from './LandingNav';
import { Outlet } from 'react-router-dom';
import Categories from './Categories';

function Landing() {
  return (
    <>
    <Banner/>
      {/* <ImageBanner /> */}
      {/* <ProductList /> */}
      <LandingNav/>
     <Outlet/>
     <Categories/>
    </>
  );
}

export default Landing;