// components/DiecastCars.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../common/components/cards";
import { URL } from "../../services/Api";
import Loading from "../../common/components/Loading";

const DiecastCars = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDiecastCars = async () => {
            try {
                const response = await axios.get(`${URL}/products`);
                const diecastCars = response.data.filter((product) => product.category === "Diecast Cars");
                console.log(diecastCars);

                setProducts(diecastCars);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDiecastCars();
    }, []);

if (loading) {
        return (
           <Loading/>
        );
    }    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Diecast Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default DiecastCars;
