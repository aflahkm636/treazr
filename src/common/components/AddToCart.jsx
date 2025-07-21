// components/AddToCart.jsx
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthProvider";
import { updateUserCart } from "../../services/UpdateCart";

const useAddToCart = () => {
  const { user, setUser } = useAuth();

  const handleAddToCart = useCallback(
    async (product, options = {}) => {
      const { showToast = true, onSuccess } = options;
      
      try {
        if (!user) {
          toast.error("Please login to add items to cart");
          return false;
        }

        const currentCart = user.cart || [];
        const existingItemIndex = currentCart.findIndex(
          (item) => item.productId === product.id
        );

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
        
        if (showToast) {
          toast.success(`${product.name} added to cart!`);
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      } catch (error) {
        toast.error("Failed to add to cart");
        console.error("Add to cart error:", error);
        return false;
      }
    },
    [user, setUser]
  );

  return { handleAddToCart };
};

export default useAddToCart;