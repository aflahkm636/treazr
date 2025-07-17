// components/ProductDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { URL } from "../../services/Api";

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        // Replace with your real API call
        fetch(`${URL}/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
    }, [id]);

    if (!product) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <img
                src={product.images?.[0] || "/default-product.jpg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded mb-6"
            />
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.category} - {product.brand}</p>
            <p className="text-lg mb-4">{product.description}</p>
            <p className="text-xl font-semibold text-blue-600 mb-4">${product.price}</p>
            <p className="text-gray-700 mb-2">Rating: ⭐ {product.rating}</p>
            <p className="text-gray-700 mb-2">Stock: {product.stock}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {product.tags?.map((tag, i) => (
                    <span key={i} className="bg-gray-200 text-sm px-3 py-1 rounded-full">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ProductDetails;
