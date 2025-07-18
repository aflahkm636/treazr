import React from "react";
import { useNavigate } from "react-router-dom";

function Banner() {
    const navigate = useNavigate();
    return (
        <section className="relative bg-gradient-to-r from-green-100 via-white to-green-50 h-[50vh] sm:h-[65vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <img
                src="https://i.pinimg.com/736x/1c/47/33/1c4733a320b6797408c0491aa8b8dabc.jpg"
                alt="MiniMint Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />

            {/* Content */}
            <div className="z-10 text-center px-6">
                <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 mb-4">Discover Rare Collectibles</h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-6">Diecast Cars, Comics & More — Curated Just for You</p>
                <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition"
                    onClick={() => {
                        navigate("/products");
                    }}
                >
                    Shop Now
                </button>
            </div>
        </section>
    );
}

export default Banner;
