import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../common/components/cards";
import { URL } from "../../services/Api";
import Loading from "../../common/components/Loading";
import { useSearch } from "./Products"; // Import the search context

const Comics = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { searchQuery } = useSearch(); // Get search query from context

    useEffect(() => {
        const fetchComics = async () => {
            try {
                const response = await axios.get(`${URL}/products`);
                const comics = response.data.filter((product) => 
                    product.category.toLowerCase() === "comics"
                );
                setProducts(comics);
                setFilteredProducts(comics); // Initialize filtered products
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchComics();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.author && product.author.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    if (loading) {
        return <Loading name="comics" />;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Comics</h2>
            
            {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "No matching comics found" : "No comics available"}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comics;