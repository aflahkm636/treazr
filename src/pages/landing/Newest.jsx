import React, { useEffect, useState } from "react";
import ProductCard from "../../common/components/cards";
import axios from "axios";
import { URL } from "../../services/Api";

function Newest() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${URL}/products`);
                const allProducts = response.data;

                // Get the last 8 items
                const latestProducts = allProducts.slice(-8); // from the end
                setProducts(latestProducts);
                console.log(latestProducts);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="text-center py-8">Loading products...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Newest product</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default React.memo(Newest);
