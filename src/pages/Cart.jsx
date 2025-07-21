import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import Swal from "sweetalert2";
import Loading from "../common/components/Loading";
import { URL } from "../services/Api";

function Cart() {
  const { user, updateUserCart, setUser, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.cart) {
      setCartItems(user.cart);
    }
  }, [user]);

  const updateCart = async (updatedCart) => {
    try {
      setUpdating(true);
      const updatedUser = await updateUserCart(user.id, updatedCart);
      setCartItems(updatedCart);
      setUser(updatedUser);
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const handleRemove = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        removeItem(productId);
        Swal.fire("Deleted!", "Item has been removed.", "success");
      }
    });
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter((item) => item.productId !== productId);
    updateCart(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
  if (cartItems.length === 0) {
    toast.warn("Cart is empty");
    return;
  }
  navigate("/order-details", { 
    state: { 
      cartItems, 
      total: calculateTotal() 
    } 
  });
};

  if (authLoading) return <Loading name="cart" />;
  if (!user) return <div className="p-4">Please login to view your cart</div>;
  if (cartItems.length === 0)
    return (
      <div className="p-4 mt-20">
        <h1>Your cart is empty!</h1>
      </div>
    );

  return (
    <div className="flex mt-15 flex-col md:flex-row gap-8">
      {/* Cart Items Section - RIGHT on desktop, TOP on mobile */}
      <div className="md:w-2/3 order-1 md:order-2 space-y-4 ml-[20px]">
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
{typeof item.price === "number" && (
  <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
)}
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
              onClick={() => handleRemove(item.productId)}
              disabled={updating}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Order Summary Section - LEFT on desktop, BOTTOM on mobile */}
      <div className="md:w-1/3 order-2 md:order-1 bg-gray-50 p-6 rounded-lg h-fit">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>
              Subtotal (
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
            </span>
            <span>${calculateTotal()}</span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>${calculateTotal()}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={updating || cartItems.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;