import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import Swal from "sweetalert2";
import { URL } from "../../services/Api";
import { 
  FiHome, 
  FiShoppingBag, 
  FiChevronDown, 
  FiChevronUp,
  FiCreditCard,
  FiPhone,
  FiMapPin,
  FiX,
  FiClock,
  FiTruck,
  FiCheckCircle
} from "react-icons/fi";

const ViewOrders = () => {
    const { user, isAuthenticated, setUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (isAuthenticated && user) {
                    const response = await axios.get(`${URL}/users/${user.id}`);
                    setOrders(response.data.orders || []);
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-amber-100 text-amber-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-indigo-100 text-indigo-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return <FiClock className="mr-1" />;
            case "processing":
                return <FiShoppingBag className="mr-1" />;
            case "shipped":
                return <FiTruck className="mr-1" />;
            case "delivered":
                return <FiCheckCircle className="mr-1" />;
            case "cancelled":
                return <FiX className="mr-1" />;
            default:
                return <FiShoppingBag className="mr-1" />;
        }
    };

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, cancel it!",
        });

        if (result.isConfirmed) {
            try {
                const updatedOrders = orders.map((order) => {
                    if (order.id === orderId) {
                        return { ...order, status: "cancelled" };
                    }
                    return order;
                });
                setOrders(updatedOrders);

                const updatedUser = { ...user, orders: updatedOrders };
                setUser(updatedUser);

                await axios.patch(`${URL}/users/${user.id}`, {
                    orders: updatedOrders,
                });

                Swal.fire("Cancelled!", "Your order has been cancelled.", "success");

                if (expandedOrder === orderId) {
                    setExpandedOrder(null);
                }
            } catch (error) {
                console.error("Error cancelling order:", error);
                Swal.fire("Error", "There was a problem cancelling your order.", "error");
                setOrders(user.orders || []);
            }
        }
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const renderProductItem = (item) => (
        <div key={item.productId} className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-md overflow-hidden mr-4">
                <img 
                    src={item.image || "/default-product.jpg"} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/default-product.jpg")}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                <p className="text-sm text-gray-500">${item.price?.toFixed(2) || "0.00"} each</p>
            </div>
            <div className="ml-4 text-sm font-medium text-gray-900">
                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Please log in to view your orders</h3>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Your Orders</h2>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <FiHome className="mr-2" />
                    Back to Home
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FiShoppingBag className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders
                        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                        .map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                            >
                                <div 
                                    className="cursor-pointer p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleOrderExpand(order.id)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                        <div className="mb-3 sm:mb-0">
                                            <h3 className="font-medium text-gray-900">
                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(order.date || order.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status || "Pending"}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                ${Number(order.total || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${expandedOrder === order.id ? 'block' : 'hidden'} sm:block`}>
                                    <div className="px-4 sm:px-6 pb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Products</h4>
                                        <div className="mb-4">
                                            {order.items?.slice(0, 2).map(renderProductItem)}
                                            {order.items?.length > 2 && expandedOrder === order.id && (
                                                <>
                                                    {order.items?.slice(2).map(renderProductItem)}
                                                    <button
                                                        onClick={() => toggleOrderExpand(order.id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 flex items-center"
                                                    >
                                                        Show fewer items
                                                        <FiChevronUp className="ml-1" />
                                                    </button>
                                                </>
                                            )}
                                            {order.items?.length > 2 && !(expandedOrder === order.id) && (
                                                <button
                                                    onClick={() => toggleOrderExpand(order.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 flex items-center"
                                                >
                                                    + {order.items.length - 2} more items
                                                    <FiChevronDown className="ml-1" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 px-4 sm:px-6 py-4">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {(order.shippingAddress || order.address) && (
                                                <div>
                                                    <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                                                        <FiMapPin className="mr-2 text-gray-400" />
                                                        Shipping Address
                                                    </h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>{(order.shippingAddress || order.address).street}</p>
                                                        <p>
                                                            {(order.shippingAddress || order.address).city},{" "}
                                                            {(order.shippingAddress || order.address).state}{" "}
                                                            {(order.shippingAddress || order.address).zip ||
                                                                (order.shippingAddress || order.address).zipCode}
                                                        </p>
                                                        <p>{(order.shippingAddress || order.address).country}</p>
                                                        {(order.shippingAddress || order.address).phone && (
                                                            <p className="flex items-center">
                                                                <FiPhone className="mr-2 text-gray-400" />
                                                                {(order.shippingAddress || order.address).phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                                                    <FiCreditCard className="mr-2 text-gray-400" />
                                                    Payment Method
                                                </h4>
                                                <p className="text-sm text-gray-600 capitalize">
                                                    {order.paymentMethod?.toLowerCase() || "Not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!["cancelled", "delivered", "shipped"].includes(order.status?.toLowerCase()) && (
                                        <div className="border-t border-gray-100 px-4 sm:px-6 py-4 bg-gray-50">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    Cancel Order
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {expandedOrder !== order.id ? (
                                    <div className="border-t border-gray-100 px-4 sm:px-6 py-3 bg-gray-50 text-center sm:hidden">
                                        <button
                                            onClick={() => toggleOrderExpand(order.id)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full"
                                        >
                                            View Details
                                            <FiChevronDown className="ml-1" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-100 px-4 sm:px-6 py-3 bg-gray-50 text-center sm:hidden">
                                        <button
                                            onClick={() => toggleOrderExpand(order.id)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center w-full"
                                        >
                                            View Less
                                            <FiChevronUp className="ml-1" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default ViewOrders;