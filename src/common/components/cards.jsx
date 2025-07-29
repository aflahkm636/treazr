import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FiHeart, FiShoppingCart, FiZap } from "react-icons/fi";
import { useAuth } from "../context/AuthProvider";
import useAddToCart from "./AddToCart";
import { URL } from "../../services/Api";
import { Tooltip } from "@mui/material";

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

  const checkProductStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API_URL}/${user.id}`);
      const inWishlist = data.wishlist?.some((item) => 
        typeof item === 'string' ? item === product.id : item.id === product.id
      );
      setIsInWishlist(!!inWishlist);
      
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

        const updatedUser = await updateUserData(user.id, { wishlist: updatedWishlist });
        setUser(updatedUser);
        
        toast.success(newWishlistStatus ? "Added to wishlist" : "Removed from wishlist");
      } catch (err) {
        console.error("Error updating wishlist:", err);
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
      className="h-full flex flex-col relative border border-gray-100 rounded-lg p-2 transition-all duration-200 bg-white cursor-pointer
                 hover:shadow-md hover:border-gray-200"
      style={{ minHeight: "280px" }}  
    >
      <button
        onClick={toggleWishlist}
        disabled={isLoading}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all ${
          isInWishlist
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-gray-600"
        } ${isLoading ? "opacity-70" : ""}`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <FiHeart className={`text-md ${isInWishlist ? "fill-current" : ""}`} /> 
      </button>

      <div className="relative mb-2 aspect-square w-full" style={{ maxHeight: "140px" }}> 
        <img
          src={product.images?.[0] || "/default-product.jpg"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
          className="w-full h-full object-contain rounded"
          loading="lazy"
        />
      </div>

      <div className="flex-grow space-y-0.5 min-h-[50px]">  
        <Tooltip title={product.name} arrow placement="top">
          <h3 
            className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {product.name}
          </h3>
        </Tooltip>
        <p className="text-base font-semibold text-gray-900">
          ${product.price.toFixed(2)}
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="capitalize">{product.category}</span>
        </div>
      </div>

      <div className="mt-1 mb-2">  
        <span
          className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full ${
            product.stock > 0 
              ? "bg-emerald-50 text-emerald-700" 
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-auto">  
        <button
          onClick={(e) => {
            e.stopPropagation();
            isInCart ? navigate("/cart") : handleAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium  // Reduced padding and text size
                      transition-colors duration-150
                      ${
                        product.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
        >
          <FiShoppingCart className="hidden sm:inline text-xs" />  
          <span>{isInCart ? "Cart" : "Add"}</span>
        </button>

        <button
          onClick={(e) => handleBuyNow(e)}
          disabled={product.stock === 0}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium 
                      transition-colors duration-150
                      ${
                        product.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
        >
          <FiZap className="hidden sm:inline text-xs" />
          <span>Buy</span>
        </button>
      </div>
    </div>
  );
});

export default ProductListCard;