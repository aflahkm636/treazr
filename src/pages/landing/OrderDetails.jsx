import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems: initialCartItems, total: initialTotal } = location.state || {};
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [total, setTotal] = useState(initialTotal || 0);

  if (!initialCartItems) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-serif font-bold text-gray-800 mb-4">Order Details</h1>
          <p className="text-gray-600 mb-6">No order information found. Please start from your cart.</p>
          <button 
            onClick={() => navigate("/cart")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    
    const newTotal = updatedCart.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    ).toFixed(2);
    
    setCartItems(updatedCart);
    setTotal(newTotal);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleProceedToAddress = () => {
    // Check stock for each item
    const outOfStockItems = cartItems.filter(item => 
      item.quantity > (item.stock || Infinity)
    );

    if (outOfStockItems.length > 0) {
      Swal.fire({
        title: "Stock Issue",
        html: `Some items exceed available stock:<br><br>
               ${outOfStockItems.map(item => 
                 `• ${item.name} (Available: ${item.stock})`
               ).join('<br>')}`,
        icon: "error",
        confirmButtonColor: "#6366f1",
        confirmButtonText: "OK"
      });
      return;
    }

    navigate("/checkout", { 
      state: { 
        cartItems,
        orderTotal: total,
        itemCount: totalItems
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Order Summary</h1>
          <p className="mt-2 text-gray-600">Review your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif font-semibold mb-6 text-gray-800">
                Your Products <span className="text-gray-500">({totalItems})</span>
              </h2>
              
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.productId} className="py-6 flex items-start">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg mr-6"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 mt-1">${item.price.toFixed(2)}</p>
                      
                      {item.stock && (
                        <p className={`text-xs mt-1 ${
                          item.quantity > item.stock ? "text-rose-600" : "text-gray-500"
                        }`}>
                          {item.quantity > item.stock 
                            ? `Only ${item.stock} available` 
                            : `${item.stock} in stock`}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <CiCircleMinus className="w-5 h-5" />
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <CiCirclePlus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="w-24 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-serif font-semibold mb-6 text-gray-800">
                Order Total
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${total}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">Calculated at next step</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                
                <button
                  onClick={handleProceedToAddress}
                  disabled={cartItems.some(item => item.quantity > (item.stock || Infinity))}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;