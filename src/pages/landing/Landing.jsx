import React from "react";

import ImageBanner from "./Imagebanner";
import Banner from "./Banner";
import TopRated from "./Toprated";
import Newest from "./Newest";
import LandingNav from "./LandingNav";
import { Outlet } from "react-router-dom";
import Categories from "./Categories";
import WhyChooseUs from "./WhyChooseUs.jsx";
import ProductList from "../products/ProductList.jsx";

function Landing() {
    return (
        <>
            <Banner />
            {/* <ImageBanner /> */}
            {/* <ProductList /> */}
            <LandingNav />
            <Outlet />
            <section id="categories">
                <Categories />
            </section>
                        <section id="categories">
                          
            <WhyChooseUs />
                        </section>

        </>
    );
}

export default Landing;
