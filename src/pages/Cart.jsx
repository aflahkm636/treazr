import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import axios from "axios";
import { URL } from "../services/Api";

function Cart() {
  const { user, setUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.cart) {
      setCartItems(user.cart);
      setLoading(false);
    }
  }, [user]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);

      const updatedCart = user.cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );

      const updatedUser = { ...user, cart: updatedCart };

      await axios.put(`${URL}/users/${user.id}`, updatedUser);
      setUser(updatedUser);
      setCartItems(updatedCart); // Update local state
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Cart updated!");
    } catch (error) {
      toast.error("Failed to update cart");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this item?");
    if (!confirmDelete) return;

    try {
      setUpdating(true);

      const updatedCart = user.cart.filter(item => item.id !== productId);
      const updatedUser = { ...user, cart: updatedCart };

      await axios.put(`http://localhost:3000/users/${user.id}`, updatedUser);
      setUser(updatedUser);
      setCartItems(updatedCart); // Update local state
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2);
  };

  if (loading) return <div>Loading cart...</div>;
  if (!user) return <div>Please login to view your cart</div>;
  if (cartItems.length === 0) return <div>Your cart is empty</div>;

  return (
    
    <div className="container mx-auto px-4 py-8">
      
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center border-b border-gray-200 py-4"
            >
              <img
                src={item.image || "/default-product.jpg"}
                onError={(e) => (e.target.src = "/default-product.jpg")}
                alt={item.name}
                className="w-20 h-20 object-cover rounded mr-4"
              />

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">${(item.price || 0).toFixed(2)}</p>
              </div>

              <div className="flex items-center">
                <button
                  title="Decrease quantity"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className={`px-3 py-1 rounded-l ${
                    item.quantity === 1 || updating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  disabled={item.quantity === 1 || updating}
                >
                  -
                </button>
                <span className="px-3 py-1 bg-gray-100">{item.quantity}</span>
                <button
                  title="Increase quantity"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className={`px-3 py-1 rounded-r ${
                    updating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  disabled={updating}
                >
                  +
                </button>
              </div>

              <div className="ml-4 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                title="Remove item"
                onClick={() => removeItem(item.id)}
                disabled={updating}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${calculateTotal()}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>

            <button
              disabled={updating}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${
                updating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
