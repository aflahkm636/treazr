import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import Swal from "sweetalert2";
import { URL } from "../../services/Api";

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
                return "bg-orange-100 text-orange-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-lime-100 text-lime-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
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
        <div key={item.productId} className="flex items-start justify-between py-3 border-b last:border-b-0">
            <div className="flex items-start space-x-4">
                {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />}
                <div>
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">Quantity: {item.quantity || 1}</div>
                    <div className="text-sm text-gray-500">Price: ${item.price?.toFixed(2) || "0.00"}</div>
                </div>
            </div>
            <div className="font-medium text-gray-800">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
        </div>
    );

    if (loading) return <div className="text-center py-8 text-lg text-gray-600">Loading your orders...</div>;
    if (error) return <div className="text-center py-8 text-red-600 text-lg">{error}</div>;
    if (!isAuthenticated) {
        return (
            <div className="text-center py-8 text-gray-700">
                Please log in to view your orders.
                <button
                    onClick={() => navigate("/login")}
                    className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 mt-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
                <button
                    onClick={() => navigate("/")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Back to Home
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 py-10">You haven't placed any orders yet.</div>
            ) : (
                <div className="space-y-6">
                    {orders
                        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                        .map((order) => (
                            <div
                                key={order.id}
                                className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <div className="cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                                    <div className="flex justify-between border-b pb-4 mb-4">
                                        <div>
                                            <span className="font-semibold text-gray-700">Order #{order.id}</span>
                                            <span className="ml-4 text-gray-500">
                                                {new Date(order.date || order.createdAt || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status || "Pending"}
                                            </span>
                                            <span className="text-gray-800 font-medium">
                                                ${Number(order.total || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Products section - always shows first two items in detailed format */}
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-700 mb-3">Products:</h4>
                                    <div className="space-y-4">
                                        {/* Always show first two items */}
                                        {order.items?.slice(0, 2).map(renderProductItem)}

                                        {/* Show remaining items if expanded */}
                                        {expandedOrder === order.id && order.items?.slice(2).map(renderProductItem)}

                                        {/* Show "more items" button if not expanded and there are more items */}
                                        {order.items?.length > 2 && !(expandedOrder === order.id) && (
                                            <button
                                                onClick={() => toggleOrderExpand(order.id)}
                                                className="text-blue-600 text-sm mt-2 hover:underline"
                                            >
                                                + {order.items.length - 2} more items
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded order details (shipping and payment info) */}
                                {expandedOrder === order.id && (
                                    <div className="mt-4 border-t pt-4">
                                        {/* Shipping and payment info */}
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            {(order.shippingAddress || order.address) && (
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-2">Shipping Address:</h4>
                                                    <div className="text-gray-600">
                                                        <p>{(order.shippingAddress || order.address).street}</p>
                                                        <p>
                                                            {(order.shippingAddress || order.address).city},{" "}
                                                            {(order.shippingAddress || order.address).state}{" "}
                                                            {(order.shippingAddress || order.address).zip ||
                                                                (order.shippingAddress || order.address).zipCode}
                                                        </p>
                                                        <p>{(order.shippingAddress || order.address).country}</p>
                                                        {(order.shippingAddress || order.address).phone && (
                                                            <p>Phone: {(order.shippingAddress || order.address).phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-2">Payment Method:</h4>
                                                <p className="text-gray-600">
                                                    {order.paymentMethod?.toUpperCase() || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Cancel order button */}
                                        {!["cancelled", "delivered", "shipped"].includes(order.status?.toLowerCase()) && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                                                >
                                                    Cancel Order
                                                </button>
                                            </div>
                                        )}
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
