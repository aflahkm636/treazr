import React, { useEffect } from "react";
import Banner from "./Banner";
import LandingNav from "./LandingNav";
import { Outlet, useNavigate } from "react-router-dom";
import Categories from "./Categories";
import WhyChooseUs from "./WhyChooseUs.jsx";
import { useAuth } from "../../common/context/AuthProvider.jsx";
function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role == "admin") {
            navigate("admin");
        } else {
            navigate("/");
        }
    }, [user, navigate]);
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
