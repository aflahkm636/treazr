import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = location.state || {};
  
  if (!cartItems) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <p>No order information found. Please start from your cart.</p>
      </div>
    );
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleProceedToAddress = () => {
    navigate("/checkout", { 
      state: { 
        cartItems,
        orderTotal: total,
        itemCount: totalItems
      } 
    });
  };

  return (
    <div className="container mx-auto p-4 mt-10">
      <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Products ({totalItems})</h2>
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center border-b border-gray-100 py-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                </div>
                <div className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg h-fit  top-4">
          <h2 className="text-xl font-bold mb-4">Order Total</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button
              onClick={handleProceedToAddress}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Proceed to Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;