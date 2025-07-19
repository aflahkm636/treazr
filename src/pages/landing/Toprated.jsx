import axios from "axios";
import React, { useEffect, useState } from "react";
import { URL } from "../../services/Api";
import ProductCard from "../../common/components/cards";
import Loading from "../../common/components/Loading";

function TopRated() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${URL}/products?rating_gte=4`);
                const sorted = response.data.sort((a, b) => b.rating - a.rating).slice(0, 8);

                setProducts(sorted);
                console.log(sorted);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


    if (loading) {
        return (
           <Loading name="Top-rated product"/>
        );
    }    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Top-Rated Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default React.memo(TopRated);
