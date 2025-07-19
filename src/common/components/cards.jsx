import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000/users";

  const handleCardClick = () => {
    navigate(`/productdetails/${product.id}`);
  };

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user) {
        toast.error("Please login to add items to cart");
        return;
      }
      
      const currentCart = user.cart || [];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.productId === product.id
      );
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart = [
          ...currentCart,
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
            name: product.name,
            image: product.images?.[0] || "/default-product.jpg",
          },
        ];
      }
      
      await updateUserData(user.id, { cart: updatedCart });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error("Add to cart error:", error);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user) {
        toast.error("Please login to add items to wishlist");
        return;
      }
      
      const currentWishlist = user.wishlist || [];
      
      if (currentWishlist.includes(product.id)) {
        toast.info("Product already in wishlist");
        return;
      }
      
      const updatedWishlist = [...currentWishlist, product.id];
      
      await updateUserData(user.id, { wishlist: updatedWishlist });
      toast.success("Added to wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
      console.error("Add to wishlist error:", error);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer border border-gray-200 rounded-lg p-4 transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-3 relative">
        <img
          src={product.images?.[0] || "/default-product.jpg"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/default-product.jpg")}
          className="w-full h-48 object-cover rounded"
        />
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          aria-label="Add to wishlist"
        >
          ♡
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold leading-snug line-clamp-3 min-h-[4.5rem]">
          {product.name}
        </h3>
        <p className="text-gray-600 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">
            ${product.price}
          </span>
          <span className="text-gray-600">⭐ {product.rating || "NA"}</span>
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