import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { URL } from "../../services/Api";

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`${URL}/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
    }, [id]);

    if (!product) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
<div className="flex flex-col lg:flex-row lg:items-center gap-10 min-h-[calc(100vh-80px)]">
                {/* Image Section */}
                <div className="lg:w-1/2 w-full">
                    <img
                        src={product.images?.[0] || "/default-product.jpg"}
                        alt={product.name}
                        className="w-full h-[400px] object-cover rounded"
                    />
                </div>

                {/* Details Section */}
                <div className="lg:w-1/2 w-full space-y-4">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-500">{product.category} - {product.brand}</p>
                    <p className="text-lg">{product.description}</p>
                    <p className="text-xl font-semibold text-blue-600">${product.price}</p>
                    <p className="text-gray-700">Rating: ⭐ {product.rating}</p>
                    <p className="text-gray-700">Stock: {product.stock}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {product.tags?.map((tag, i) => (
                            <span key={i} className="bg-gray-200 text-sm px-3 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
                            onClick={() => alert("Added to cart!")}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition"
                            onClick={() => alert("Proceed to Buy")}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
