import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/productdetails/${product.id}`);
;
    };

    return (
        <div
            onClick={handleCardClick}
            className="cursor-pointer border border-gray-200 rounded-lg p-4 transition-all hover:-translate-y-1 hover:shadow-md"
        >
            <div className="mb-3">
                <img
                    src={product.images?.[0] || "/default-product.jpg"}
                    alt={product.name}
                    onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
                    className="w-full h-48 object-cover rounded"
                />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold leading-snug line-clamp-3 min-h-[4.5rem]">
                    {product.name}
                </h3>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
                <div className="text-xl font-bold text-blue-600">
                    ${product.price}
                    <p className="text-gray-600">Rating: ⭐ {product.rating}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent card click from firing
                        // Add to cart logic here
                        alert("Added to cart!");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
