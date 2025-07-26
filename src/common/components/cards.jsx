import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { CiHeart } from "react-icons/ci";
import { useAuth } from "../context/AuthProvider";
import useAddToCart from "./AddToCart";
import { URL } from "../../services/Api";

const ProductListCard = React.memo(({ product }) => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const API_URL = `${URL}/users`;

  const updateUserData = async (userId, updatedData) => {
    try {
      const response = await axios.patch(`${API_URL}/${userId}`, updatedData);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      toast.error("Failed to update user data");
      console.error(error);
      throw error;
    }
  };

  // Check if product is in wishlist and cart
  const checkProductStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API_URL}/${user.id}`);
      // Check wishlist status
      const inWishlist = data.wishlist?.some((item) => 
        typeof item === 'string' ? item === product.id : item.id === product.id
      );
      setIsInWishlist(!!inWishlist);
      
      // Check cart status
      const inCart = data.cart?.some((item) => item.productId === product.id);
      setIsInCart(!!inCart);
    } catch (err) {
      console.error("Error checking product status:", err);
    }
  }, [user, product.id]);

  useEffect(() => {
    checkProductStatus();
  }, [checkProductStatus]);

  const toggleWishlist = useCallback(
    async (e) => {
      e.stopPropagation();
      if (isLoading) return;

      if (!user) {
        toast.warning("Please login to use wishlist");
        return;
      }

      setIsLoading(true);
      try {
        // Optimistically update the UI
        const newWishlistStatus = !isInWishlist;
        setIsInWishlist(newWishlistStatus);

        const { data } = await axios.get(`${API_URL}/${user.id}`);
        let updatedWishlist;
        const exists = data.wishlist?.some((item) => 
          typeof item === 'string' ? item === product.id : item.id === product.id
        );

        if (exists) {
          updatedWishlist = data.wishlist.filter((item) => 
            typeof item === 'string' ? item !== product.id : item.id !== product.id
          );
        } else {
          updatedWishlist = [...(data.wishlist || []), product.id];
        }

        // Update the server and local storage
        const updatedUser = await updateUserData(user.id, { wishlist: updatedWishlist });
        setUser(updatedUser);
        
        toast.success(newWishlistStatus ? "Added to wishlist" : "Removed from wishlist");
      } catch (err) {
        console.error("Error updating wishlist:", err);
        // Revert the UI if the request fails
        setIsInWishlist((prev) => !prev);
        toast.error("Failed to update wishlist");
      } finally {
        setIsLoading(false);
      }
    },
    [user, product, isLoading, isInWishlist]
  );

  const { handleAddToCart } = useAddToCart();

  const handleBuyNow = useCallback((e) => {
  e?.stopPropagation();
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
}, [navigate, product]);

  const handleClick = useCallback(() => {
    navigate(`/productdetails/${product.id}`);
  }, [navigate, product.id]);

  return (
    <div
      onClick={handleClick}
      className="h-full flex flex-col justify-between relative border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-300 group bg-white cursor-pointer
                 hover:shadow-lg hover:border-gray-300 hover:scale-[1.02] transform-gpu"
    >
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        disabled={isLoading}
        className={`absolute top-2.5 left-2.5 z-10 p-1.5 rounded-full shadow-md transition-all duration-200 ${
          isInWishlist
            ? "text-red-500 bg-white hover:bg-red-50"
            : "text-gray-500 bg-white hover:bg-gray-50"
        } ${isLoading ? "opacity-70" : ""}
        active:scale-90`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <CiHeart className={`text-lg ${isInWishlist ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <div className="relative mb-2" style={{ height: "160px" }}>
        <img
          src={product.images?.[0] || "/default-product.jpg"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
          className="w-full h-full object-contain rounded transition-transform duration-300 group-hover:scale-105"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow space-y-1.5">
        <h3 
          className="text-sm font-medium text-gray-900 truncate px-0.5 group-hover:text-gray-700"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-base font-bold text-gray-900 group-hover:text-gray-800">
          ${product.price.toFixed(2)}
        </p>
        <div className="flex items-center text-xs text-gray-500 space-x-1.5">
          <span className="text-gray-700 group-hover:text-gray-600">{product.category}</span>
          <span>•</span>
          <span className="text-gray-700 group-hover:text-gray-600">{product.brand}</span>
        </div>
      </div>

      {/* Stock Status */}
      <span
        className={`mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full w-fit transition-colors duration-200 ${
          product.stock > 0 
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
        }`}
      >
        {product.stock > 0 ? "In Stock" : "Out of Stock"}
      </span>

      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            isInCart ? navigate("/cart") : handleAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`border text-amber-800 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center 
                      transition-all duration-200 active:scale-95
                      ${product.stock === 0
                        ? "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                        : "border-amber-800 hover:bg-amber-50 hover:border-amber-900 hover:text-amber-900 active:bg-amber-100"
                      }`}
        >
          {product.stock === 0 ? "Out of Stock" : (isInCart ? "Go to Cart" : "Add to Cart")}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBuyNow(e);
          }}
          disabled={product.stock === 0}
          className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center 
                      transition-all duration-200 active:scale-95
                      ${product.stock === 0
                        ? "cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                        : "border border-gray-800 text-gray-800 hover:bg-gray-50 hover:border-black hover:text-black active:bg-gray-100"
                      }`}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
});

export default ProductListCard;