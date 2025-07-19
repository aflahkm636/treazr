import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddressForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, orderTotal, itemCount } = location.state || {};
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please login to proceed");
        return;
      }

      // Create new order
      const newOrder = {
        id: Date.now().toString(),
        items: cartItems,
        total: orderTotal,
        address,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      // Update user's orders
      const updatedOrders = [...user.orders, newOrder];
      await axios.patch(`http://localhost:3000/users/${user.id}`, {
        orders: updatedOrders,
        cart: [] // Clear cart after order
      });

      // Update localStorage
      const updatedUser = { ...user, orders: updatedOrders, cart: [] };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Order placed successfully!");
      navigate("/order-confirmation", { state: { orderId: newOrder.id } });
    } catch (error) {
      toast.error("Failed to place order");
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>
        <p>No order information found. Please start from your cart.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Country</label>
                <select
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={address.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Items ({itemCount})</span>
              <span>${orderTotal}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${orderTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;