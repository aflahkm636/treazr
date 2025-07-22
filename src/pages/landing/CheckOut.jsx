import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../common/context/AuthProvider";
import { FaHome, FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaPiggyBank } from "react-icons/fa";
import { RiVisaLine, RiMastercardLine } from "react-icons/ri";
import { SiPaytm, SiGooglepay, SiPhonepe } from "react-icons/si";

const Checkout = () => {
    const { user, setUser } = useAuth();
    const userId = user?.id;
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
    });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [useExistingAddress, setUseExistingAddress] = useState(true);
    const [cardType, setCardType] = useState("credit");
    const [upiProvider, setUpiProvider] = useState("googlepay");
    const [shippingFee, setShippingFee] = useState(0);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                const [userResponse, productsResponse] = await Promise.all([
                    axios.get(`http://localhost:3000/users/${userId}`),
                    axios.get("http://localhost:3000/products"),
                ]);
                setUser(userResponse.data);
                setProducts(productsResponse.data);
                if (userResponse.data.shippingAddresses?.length > 0) {
                    setSelectedAddress(userResponse.data.shippingAddresses[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    useEffect(() => {
        // Set shipping fee based on payment method
        setShippingFee(paymentMethod === "cod" ? 5 : 0);
    }, [paymentMethod]);

    const handleAddressChange = (e) => setSelectedAddress(JSON.parse(e.target.value));
    const handleNewAddressChange = (e) => setNewAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const calculateSubtotal = () =>
        user?.cart?.reduce((total, item) => {
            const product = products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0) || 0;

    const calculateTotal = () => (calculateSubtotal() + shippingFee).toFixed(2);

    const saveAddress = async () => {
        try {
            const updatedUser = await axios.patch(`http://localhost:3000/users/${userId}`, {
                shippingAddresses: [...(user.shippingAddresses || []), newAddress],
            });
            setUser(updatedUser.data);
            setSelectedAddress(newAddress);
            setUseExistingAddress(true);
            Swal.fire("Success", "Address saved successfully", "success");
        } catch (error) {
            console.error("Error saving address:", error);
            Swal.fire("Error", "Failed to save address", "error");
        }
    };

    const handlePlaceOrder = async () => {
        try {
            const shippingAddress = useExistingAddress ? selectedAddress : newAddress;

            const orderItems = user.cart.map((cartItem) => {
                const product = products.find((p) => p.id === cartItem.productId);
                return {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    image: product.images[0],
                };
            });

            const order = {
                id: Date.now().toString(),
                items: orderItems,
                subtotal: calculateSubtotal(),
                shippingFee,
                total: calculateTotal(),
                shippingAddress,
                paymentMethod,
                paymentDetails:
                    paymentMethod === "card"
                        ? { type: cardType }
                        : paymentMethod === "upi"
                        ? { provider: upiProvider }
                        : {},
                status: "processing",
                date: new Date().toISOString(),
            };

            await axios.patch(`http://localhost:3000/users/${userId}`, {
                orders: [...(user.orders || []), order],
                cart: [],
                shippingAddresses: [...(user.shippingAddresses || []), shippingAddress].filter(
                    (addr, index, self) => index === self.findIndex((a) => JSON.stringify(a) === JSON.stringify(addr))
                ),
            });

            Swal.fire({
                title: "Order Placed!",
                text: "Your order has been placed successfully",
                icon: "success",
                confirmButtonText: "View Order",
            }).then(() => navigate(`/orderstatus/${order.id}`));
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire("Error", "Failed to place order", "error");
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-2xl text-gray-400">Loading your order...</div>
            </div>
        );

    if (!user)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-xl">Please login to proceed with checkout</div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Complete Your Purchase</h1>
                    <p className="mt-2 text-gray-600">Review your order details before payment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping and Payment Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Address Section */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-6">
                                <FaHome className="text-indigo-600 mr-3 text-xl" />
                                <h2 className="text-xl font-serif font-semibold text-gray-800">Shipping Information</h2>
                            </div>

                            <div className="flex gap-6 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        checked={useExistingAddress}
                                        onChange={() => setUseExistingAddress(true)}
                                    />
                                    <span className="font-medium">Use Saved Address</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        checked={!useExistingAddress}
                                        onChange={() => setUseExistingAddress(false)}
                                    />
                                    <span className="font-medium">New Address</span>
                                </label>
                            </div>

                            {useExistingAddress ? (
                                user.shippingAddresses?.length ? (
                                    <select
                                        value={JSON.stringify(selectedAddress)}
                                        onChange={handleAddressChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {user.shippingAddresses.map((address, i) => (
                                            <option key={i} value={JSON.stringify(address)}>
                                                {`${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-gray-500">No saved addresses found.</p>
                                )
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {["street", "city", "state", "zip", "country"].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </label>
                                                <input
                                                    type={field === "zip" ? "number" : "text"}
                                                    name={field}
                                                    placeholder={
                                                        field === "zip"
                                                            ? "PIN Code"
                                                            : field.charAt(0).toUpperCase() + field.slice(1)
                                                    }
                                                    value={newAddress[field]}
                                                    onChange={handleNewAddressChange}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={saveAddress}
                                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Save This Address
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment Section - Updated Styling */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-6">
                                <FaCreditCard className="text-indigo-600 mr-3 text-xl" />
                                <h2 className="text-xl font-serif font-semibold text-gray-800">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Cash on Delivery */}
                                <div 
                                    className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                        paymentMethod === "cod" 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                    onClick={() => setPaymentMethod("cod")}
                                >
                                    <div className="flex items-start">
                                        <input
                                            type="radio"
                                            className="mt-1 mr-3 form-radio text-indigo-600"
                                            checked={paymentMethod === "cod"}
                                            readOnly
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <FaMoneyBillWave className="text-green-500 mr-2 text-lg" />
                                                <span className="font-medium">Cash on Delivery</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Pay when you receive your order. ${shippingFee} convenience fee applies.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Credit/Debit Card */}
                                <div 
                                    className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                        paymentMethod === "card" 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                    onClick={() => setPaymentMethod("card")}
                                >
                                    <div className="flex items-start">
                                        <input
                                            type="radio"
                                            className="mt-1 mr-3 form-radio text-indigo-600"
                                            checked={paymentMethod === "card"}
                                            readOnly
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <FaCreditCard className="text-blue-500 mr-2 text-lg" />
                                                <span className="font-medium">Credit/Debit Card</span>
                                            </div>
                                            
                                            {paymentMethod === "card" && (
                                                <div className="mt-4 space-y-4">
                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="cardType"
                                                                value="credit"
                                                                checked={cardType === "credit"}
                                                                onChange={(e) => setCardType(e.target.value)}
                                                                className="text-indigo-600"
                                                            />
                                                            <div className="flex items-center">
                                                                <RiVisaLine className="text-blue-800 text-xl mr-1" />
                                                                <RiMastercardLine className="text-red-500 text-xl mr-2" />
                                                                Credit Card
                                                            </div>
                                                        </label>
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="cardType"
                                                                value="debit"
                                                                checked={cardType === "debit"}
                                                                onChange={(e) => setCardType(e.target.value)}
                                                                className="text-indigo-600"
                                                            />
                                                            Debit Card
                                                        </label>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="1234 5678 9012 3456" 
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="MM/YY" 
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">CVV</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="123" 
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Cardholder Name</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="John Doe" 
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* UPI Payment */}
                                <div 
                                    className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                        paymentMethod === "upi" 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                    onClick={() => setPaymentMethod("upi")}
                                >
                                    <div className="flex items-start">
                                        <input
                                            type="radio"
                                            className="mt-1 mr-3 form-radio text-indigo-600"
                                            checked={paymentMethod === "upi"}
                                            readOnly
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <FaMobileAlt className="text-purple-500 mr-2 text-lg" />
                                                <span className="font-medium">UPI Payment</span>
                                            </div>
                                            
                                            {paymentMethod === "upi" && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                                                upiProvider === "googlepay"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                                            }`}
                                                            onClick={() => setUpiProvider("googlepay")}
                                                        >
                                                            <SiGooglepay className="text-blue-600 text-lg" />
                                                            Google Pay
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                                                upiProvider === "paytm"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                                            }`}
                                                            onClick={() => setUpiProvider("paytm")}
                                                        >
                                                            <SiPaytm className="text-blue-500 text-lg" />
                                                            Paytm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                                                upiProvider === "phonepe"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                                            }`}
                                                            onClick={() => setUpiProvider("phonepe")}
                                                        >
                                                            <SiPhonepe className="text-purple-600 text-lg" />
                                                            PhonePe
                                                        </button>
                                                    </div>
                                                    <div className="mt-2">
                                                        <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                                                        <input
                                                            type="text"
                                                            placeholder="name@upi"
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Net Banking */}
                                <div 
                                    className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                        paymentMethod === "netbanking" 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                    onClick={() => setPaymentMethod("netbanking")}
                                >
                                    <div className="flex items-start">
                                        <input
                                            type="radio"
                                            className="mt-1 mr-3 form-radio text-indigo-600"
                                            checked={paymentMethod === "netbanking"}
                                            readOnly
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <FaPiggyBank className="text-green-600 mr-2 text-lg" />
                                                <span className="font-medium">Net Banking</span>
                                            </div>
                                            
                                            {paymentMethod === "netbanking" && (
                                                <div className="mt-4">
                                                    <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                                        <option value="">Select your bank</option>
                                                        <option value="sbi">State Bank of India</option>
                                                        <option value="hdfc">HDFC Bank</option>
                                                        <option value="icici">ICICI Bank</option>
                                                        <option value="axis">Axis Bank</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary - Updated with scroll for many items */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-xl font-serif font-semibold mb-6 text-gray-800">Order Summary</h2>

                            {user.cart.length === 0 ? (
                                <p className="text-gray-500">Your cart is empty.</p>
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                                        {user.cart.map((item) => {
                                            const product = products.find((p) => p.id === item.productId);
                                            return product ? (
                                                <div key={item.productId} className="py-4 flex items-center">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg mr-4"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{product.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            ${product.price.toFixed(2)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium whitespace-nowrap ml-2">
                                                        ${(product.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>${calculateSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>${shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span>${calculateTotal()}</span>
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={user.cart.length === 0 || (!useExistingAddress && !newAddress.street)}
                                            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;