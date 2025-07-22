import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAddToCart from "./AddToCart";
import { URL } from "../../services/Api";
import { CiShoppingCart, CiStar } from "react-icons/ci";

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { handleAddToCart } = useAddToCart();

    useEffect(() => {
        fetch(`${URL}/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
    }, [id]);

    const handleBuyNow = async () => {
        try {
            setIsLoading(true);
            const success = await handleAddToCart(product, { showToast: false });
            if (success) {
                navigate("/cart");
            }
        } catch (error) {
            toast.error("Failed to proceed to checkout");
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-2xl text-gray-400">Loading luxury finds...</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mb-20">
            {/* Breadcrumbs */}
            <nav className="text-sm mb-6 text-gray-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link to="/" className="hover:underline hover:text-gray-800">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li>
                        <Link to="/products" className="hover:underline hover:text-gray-800">
                            Products
                        </Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li className="text-gray-700">{product.name}</li>
                </ol>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Product Image */}
                <div className="lg:w-1/2 w-full">
                    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white h-full">
                        <img
                            src={product.images?.[0] || "/default-product.jpg"}
                            alt={product.name}
                            className="w-full h-[500px] object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:w-1/2 w-full flex flex-col justify-between h-[500px]">
                    <div className="space-y-6 text-gray-800">
                        <div className="pb-3 border-b border-gray-200">
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                <span>{product.brand}</span>
                                <span className="flex items-center gap-1 text-amber-600">
                                    <CiStar className="w-4 h-4" />
                                    {product.rating}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-2xl font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                                        product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                    }`}
                                >
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                                <span className="text-sm text-gray-400">| {product.category}</span>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600">{product.description}</p>
                        </div>

                        {product.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {product.tags.map((tag, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="pt-6 space-y-3">
                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isLoading || product.stock <= 0}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-100 disabled:opacity-60"
                        >
                            <CiShoppingCart className="w-5 h-5" />
                            {isLoading ? "Adding..." : "Add to Cart"}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={isLoading || product.stock <= 0}
                            className="w-full bg-white border border-amber-500 text-amber-600 font-semibold py-3 rounded-md transition-all duration-300 hover:bg-amber-50 hover:shadow-lg hover:scale-[1.02] active:scale-100 disabled:opacity-60"
                        >
                            {isLoading ? "Processing..." : "Buy Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
