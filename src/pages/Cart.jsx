import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const API_URL = "http://localhost:3000/users";
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/${user.id}`);
        setCartItems(response.data.cart || []);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateUserCart = async (updatedCart) => {
    try {
      setUpdating(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.patch(`${API_URL}/${user.id}`, {
        cart: updatedCart,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      setCartItems(updatedCart);
    } catch (error) {
      toast.error("Failed to update cart");
      console.error("Update cart error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updateUserCart(updatedCart);
  };

  const removeItem = (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (!confirmDelete) return;

    const updatedCart = cartItems.filter(
      (item) => item.productId !== productId
    );
    updateUserCart(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  if (loading) return <div className="p-4">Loading cart...</div>;
  if (!JSON.parse(localStorage.getItem("user"))) {
    return <div className="p-4">Please login to view your cart</div>;
  }
  if (cartItems.length === 0) return <div className="p-4">Your cart is empty</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col sm:flex-row items-center border-b border-gray-200 py-4 gap-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={updating || item.quantity <= 1}
                  className="px-3 py-1 bg-gray-200 rounded-l disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-gray-100">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={updating}
                  className="px-3 py-1 bg-gray-200 rounded-r disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <div className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                disabled={updating}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
            <button
              disabled={updating || cartItems.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;