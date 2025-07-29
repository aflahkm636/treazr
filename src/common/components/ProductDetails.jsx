import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAddToCart from "./AddToCart";
import { URL } from "../../services/Api";
import { FiShoppingCart, FiStar, FiChevronRight, FiArrowLeft, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthProvider";

const ProductDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const navigate = useNavigate();
    const { handleAddToCart } = useAddToCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${URL}/products/${id}`);
                const data = await response.json();
                setProduct(data);
                
                if (user?.wishlist?.includes(data.id)) {
                    setIsInWishlist(true);
                }
            } catch (error) {
                toast.error("Failed to load product details");
                console.error(error);
            }
        };

        fetchProduct();
    }, [id, user]);

    const toggleWishlist = async () => {
        if (!user) {
            toast.warning("Please login to manage your wishlist");
            return;
        }

        try {
            setIsLoading(true);
            setIsInWishlist(!isInWishlist);
            toast.success(!isInWishlist ? "Added to wishlist" : "Removed from wishlist");
        } catch (error) {
            toast.error("Failed to update wishlist");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyNow = async () => {
        try {
            setIsLoading(true);
            navigate("/buy-now", {
                state: {
                    product: {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.images?.[0] || "/default-product.jpg",
                        stock: product.stock,
                        brand: product.brand,
                        category: product.category
                    }
                }
            });
        } catch (error) {
            toast.error("Failed to proceed to checkout");
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 mt-15">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
                <FiArrowLeft className="mr-2" />
                Back to Products
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Image - Uniform Size */}
                <div className="lg:w-1/2 flex flex-col">
                    <div className="bg-gray-50 rounded-lg p-6 flex justify-center items-center h-96">
                        <img
                            src={product.images?.[0] || "/default-product.jpg"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => (e.target.src = "/default-product.jpg")}
                            loading="lazy"
                        />
                    </div>
                    
                    {/* Buttons Below Image */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isLoading || product.stock <= 0}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FiShoppingCart />
                            {isLoading ? "Adding..." : "Add to Cart"}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={isLoading || product.stock <= 0}
                            className="flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                            <FiHeart />
                            Buy Now
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:w-1/2 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <p className="text-blue-600">{product.brand}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                <FiStar className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {product.rating} ({product.reviewCount || 0} reviews)
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    ${product.price.toFixed(2)}
                                </p>
                                {product.originalPrice && (
                                    <p className="text-sm text-gray-400 line-through">
                                        ${product.originalPrice.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </span>
                            <span className="text-xs text-gray-500">SKU: {product.id}</span>
                        </div>

                        <div className="pt-2">
                            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                            <p className="text-gray-600 text-sm">{product.description}</p>
                        </div>

                        {product.tags?.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-gray-900 mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;