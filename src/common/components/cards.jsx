import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUserCart } from "../../services/UpdateCart";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/productdetails/${product.id}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        
        try {
            // Get current user from localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            
            if (!user) {
                toast.error("Please login to add items to cart");
                return;
            }
            
            // Create or update the cart
            const currentCart = user.cart || [];
            const existingItemIndex = currentCart.findIndex(item => item.productId === product.id);
            
            let updatedCart;
            if (existingItemIndex >= 0) {
                // If product already in cart, increase quantity
                updatedCart = [...currentCart];
                updatedCart[existingItemIndex].quantity += 1;
            } else {
                // Add new product to cart
                updatedCart = [
                    ...currentCart,
                    {
                        productId: product.id,
                        quantity: 1,
                        price: product.price,
                        name: product.name,
                        image: product.images?.[0] || "/default-product.jpg"
                    }
                ];
            }
            
            // Update cart in backend and localStorage
            await updateUserCart(user.id, updatedCart);
            
            toast.success("Added to cart!");
        } catch (error) {
            toast.error("Failed to add to cart");
            console.error("Add to cart error:", error);
        }
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
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);