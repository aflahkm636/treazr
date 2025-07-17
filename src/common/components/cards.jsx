// cards/ProductCard.js
import React from "react";

const ProductCard = ({ product }) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-3">
                <img
                    src={product.images?.[0] || "/default-product.jpg"}
                    alt={product.name}
                    onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
                    className="w-full h-48 object-cover rounded"
                />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
                <div className="text-xl font-bold text-blue-600">${product.price}</div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
