import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { updateUserWishlist } from "../services/UpdateWishlist";
import { URL } from "../services/Api";
import { updateUserCart } from "../services/UpdateCart";
import { CiHeart, CiTrash } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import Loading from "../common/components/Loading";

function Wishlist() {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const getProductId = (item) => {
        return typeof item === 'string' ? item : item.id;
    };

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

    const fetchWishlistProducts = async (wishlistItems) => {
        try {
            setLoading(true);
            const validIds = wishlistItems
                .map(item => getProductId(item))
                .filter(id => id && String(id).trim() !== "");

            if (validIds.length === 0) {
                setWishlistProducts([]);
                return;
            }

            const products = [];
            for (const id of validIds) {
                try {
                    const response = await axios.get(`${URL}/products/${id}`);
                    if (response.data) {
                        products.push(response.data);
                    }
                } catch (error) {
                    console.error(`Failed to fetch product ${id}:`, error);
                    const updatedUser = await updateUserWishlist(
                        user.id,
                        user.wishlist.filter(wishlistItem => getProductId(wishlistItem) !== id)
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

    const handleRemoveFromWishlist = async (productId) => {
        try {
            if (!user) {
                toast.error("Please login to manage your wishlist");
                return;
            }

            setLoading(true);
            const updatedWishlist = user.wishlist.filter(
                item => getProductId(item) !== productId
            );
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
        return (
           <Loading/>
        );}

    if (!user) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <p className="text-gray-700 mb-4">Please login to view your wishlist</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    const productsCount = wishlistProducts.length;

    if (productsCount === 0) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full p-6 bg-white rounded-lg shadow-sm">
                    <CiHeart className="h-16 w-16 mx-auto text-gray-400" />
                    <h2 className="text-xl font-medium text-gray-800 mt-4">
                        Your wishlist is empty
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Save items you love to your wishlist
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 mt-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Your Wishlist</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        {productsCount} {productsCount === 1 ? "item" : "items"}
                    </p>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {wishlistProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                        >
                            <div className="relative h-48 w-full">
                                <img
                                    src={product.images?.[0] || "/default-product.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => navigate(`/products/${product.id}`)}
                                    onError={(e) => {
                                        e.target.src = "/default-product.jpg";
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFromWishlist(product.id);
                                    }}
                                    disabled={loading}
                                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow hover:bg-red-100 hover:text-red-600 transition-colors backdrop-blur-sm"
                                >
                                    <CiTrash className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-3 flex flex-col justify-between flex-grow">
                                <div>
                                    <h3
                                        className="text-sm font-medium text-gray-900 mb-1 cursor-pointer hover:text-indigo-600 line-clamp-2"
                                        onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-500 text-xs">{product.category}</p>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                        ${product.price}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        disabled={loading}
                                        className="w-full mt-2 py-1.5 px-3 text-xs border border-transparent rounded-md shadow-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Wishlist;