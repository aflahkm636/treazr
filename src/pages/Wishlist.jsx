import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { updateUserWishlist } from "../services/UpdateWishlist";
import { URL } from "../services/Api";
import { updateUserCart } from "../services/UpdateCart";

function Wishlist() {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Load user and wishlist on component mount and when user changes
    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);

        if (currentUser?.wishlist?.length > 0) {
            fetchWishlistProducts(currentUser.wishlist);
        } else {
            setWishlistProducts([]);
            setLoading(false);
        }
    }, []);

    // Add this useEffect to listen for localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser?.id !== user?.id) {
                setUser(currentUser);
            }
            if (currentUser?.wishlist?.length > 0) {
                fetchWishlistProducts(currentUser.wishlist);
            } else {
                setWishlistProducts([]);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [user]);

    // Improved product fetching with error handling
    const fetchWishlistProducts = async (productIds) => {
        try {
            setLoading(true);
            const validIds = productIds.filter((id) => id && id.trim() !== "");

            if (validIds.length === 0) {
                setWishlistProducts([]);
                return;
            }

            // Fetch products with error handling for each request
            const products = [];
            for (const id of validIds) {
                try {
                    const response = await axios.get(`${URL}/products/${id}`);
                    if (response.data) {
                        products.push(response.data);
                    }
                } catch (error) {
                    console.error(`Failed to fetch product ${id}:`, error);
                    // Remove invalid product from wishlist
                    const updatedUser = await updateUserWishlist(
                        user.id,
                        user.wishlist.filter((wId) => wId !== id)
                    );
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            }

            setWishlistProducts(products);
        } catch (error) {
            toast.error("Failed to load wishlist items");
            console.error("Error fetching wishlist products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Add product to cart
    const handleAddToCart = async (product) => {
        try {
            if (!user) {
                toast.error("Please login to manage your cart");
                return;
            }

            setLoading(true);
            const currentCart = user.cart || [];
            const existingItemIndex = currentCart.findIndex((item) => item.productId === product.id);

            const updatedCart = [...currentCart];

            if (existingItemIndex >= 0) {
                updatedCart[existingItemIndex].quantity += 1;
            } else {
                updatedCart.push({
                    productId: product.id,
                    quantity: 1,
                    price: product.price,
                    name: product.name,
                    image: product.images?.[0] || "/default-product.jpg",
                });
            }

            const updatedUser = await updateUserCart(user.id, updatedCart);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error("Failed to add to cart");
            console.error("Add to cart error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Remove product from wishlist
    const handleRemoveFromWishlist = async (productId) => {
        try {
            if (!user) {
                toast.error("Please login to manage your wishlist");
                return;
            }

            setLoading(true);
            const updatedWishlist = user.wishlist.filter((id) => id !== productId);
            const updatedUser = await updateUserWishlist(user.id, updatedWishlist);

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setWishlistProducts((prev) => prev.filter((product) => product.id !== productId));

            toast.success("Removed from wishlist");
        } catch (error) {
            toast.error("Failed to remove from wishlist");
            console.error("Remove from wishlist error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading your wishlist...</div>;
    }

    if (!user) {
        return <div className="p-6 text-center">Please login to view your wishlist</div>;
    }

    if (user.wishlist.length === 0 || wishlistProducts.length === 0) {
        return <div className="p-6 text-center">Your wishlist is empty</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 mt-20">
            <h1 className="text-2xl font-bold mb-6">
                Your Wishlist ({wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""})
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="mb-4">
                            <img
                                src={product.images?.[0] || "/default-product.jpg"}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded"
                                onError={(e) => {
                                    e.target.src = "/default-product.jpg";
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-600">${product.price}</p>
                            <p className="text-sm text-gray-500">Product ID: {product.id}</p>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
                                >
                                    Add to Cart
                                </button>

                                <button
                                    onClick={() => handleRemoveFromWishlist(product.id)}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;
