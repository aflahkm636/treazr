import React, { useEffect } from "react";
import Banner from "./Banner";
import LandingNav from "./LandingNav";
import { Outlet, useNavigate } from "react-router-dom";
import Categories from "./Categories";
import WhyChooseUs from "./WhyChooseUs.jsx";
import { useAuth } from "../../common/context/AuthProvider.jsx";
import toast from "react-hot-toast";
function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
            // Show login success toast if available
        const message = localStorage.getItem("loginSuccess");
        if (message) {
            toast.success(message, {
                position: "top-right",
                duration: 3000,
            });
            localStorage.removeItem("loginSuccess");
        }

        if (user && user.role == "admin") {
            navigate("admin");
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
