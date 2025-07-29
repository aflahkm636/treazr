import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";

function Banner() {
    const navigate = useNavigate();

    return (
        <section className="relative h-[50vh] sm:h-[65vh] bg-gradient-to-r from-emerald-50 via-white to-emerald-100 overflow-hidden rounded-2xl shadow-md mb-8">
            {/* Background Image */}
            <img
                src="https://i.pinimg.com/736x/1c/47/33/1c4733a320b6797408c0491aa8b8dabc.jpg"
                alt="MiniMint Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />

            {/* Overlay for extra contrast if needed */}
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-4 drop-shadow-sm">
                    Discover Rare Collectibles
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl drop-shadow-sm">
                    Diecast Cars, Comics & More — Curated Just for You
                </p>

                <button
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 text-white font-medium px-6 py-3 rounded-full shadow-lg transition-all duration-200"
                    onClick={() => navigate("/products")}
                >
                    <FaShoppingBag className="text-lg" />
                    <span>Shop Now</span>
                </button>
            </div>
        </section>
    );
}

export default Banner;
