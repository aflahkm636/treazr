import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaChevronDown,
    FaChevronUp,
    FaBox,
    FaMoneyBillWave,
    FaTruck,
    FaTimesCircle,
    FaCheckCircle,
    FaInfoCircle,
    FaUser,
    FaSearch,
} from "react-icons/fa";
import axios from "axios";
import { URL } from "../services/Api";

const RecentOrders = () => {
    const navigate = useNavigate();
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                const response = await axios.get(`${URL}/users`); // get all users
                const users = response.data;

                // Flatten all orders across users and include user reference
                const allOrders = users.flatMap((user) =>
                    (user.orders || []).map((order) => ({
                        ...order,
                        userName: user.name,
                        userEmail: user.email,
                    }))
                );

                // Sort orders by date or createdAt (newest first)
                const sortedOrders = allOrders.sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt);
                    const dateB = new Date(b.date || b.createdAt);
                    return dateB - dateA;
                });

                setOrders(sortedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case "completed":
                return <FaCheckCircle className="text-green-500" />;
            case "processing":
                return <FaInfoCircle className="text-blue-500" />;
            case "shipped":
                return <FaTruck className="text-yellow-500" />;
            case "cancelled":
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const filteredOrders = orders.filter((order) => {
        // Filter by search term (order ID or customer name/email)
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filter by status
        const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://localhost:3000/orders/${orderId}`, {
                status: newStatus,
            });
            setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
                <p className="text-gray-600 mb-4">There are no orders in the system yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-gray-800">All Orders</h3>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            onClick={() => toggleOrderDetails(order.id)}
                            className="bg-gray-50 hover:bg-gray-100 p-4 cursor-pointer transition duration-200"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order #</p>
                                        <p className="font-medium text-gray-800">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-800 flex items-center gap-2">
                                            <FaUser className="text-gray-400" />
                                            {order.userName || order.userEmail || "Guest"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium text-gray-800">
                                            {new Date(order.date || order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">${order.total}</span>
                                        <span
                                            className={`${getStatusColor(
                                                order.status
                                            )} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}
                                        >
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                    {expandedOrder === order.id ? (
                                        <FaChevronUp className="text-gray-500" />
                                    ) : (
                                        <FaChevronDown className="text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="p-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
                                            <FaBox className="text-blue-500" />
                                            Items ({order.items.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items.map((item, index) => (
                                                <div
                                                    key={`${item.productId}-${index}`}
                                                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition duration-200"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-md cursor-pointer"
                                                        onClick={() => navigate(`/admin/products/${item.productId}`)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <p className="text-gray-600">
                                                            {item.quantity} × ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-gray-800 font-medium">
                                                        ${(item.quantity * item.price).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
                                            <FaMoneyBillWave className="text-green-500" />
                                            Payment Information
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-500">Payment Method</p>
                                                <p className="font-medium text-gray-800">
                                                    {order.paymentMethod?.toUpperCase() || "Not specified"}
                                                </p>
                                            </div>
                                            {order.paymentDetails && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Details</p>
                                                    <div className="bg-white p-3 rounded text-sm font-mono overflow-x-auto">
                                                        {JSON.stringify(order.paymentDetails, null, 2)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
                                            <FaTruck className="text-purple-500" />
                                            Shipping Address
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            {order.shippingAddress ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-gray-800">
                                                        {order.shippingAddress.street}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                                        {order.shippingAddress.zip}
                                                    </p>
                                                    <p className="text-gray-600">{order.shippingAddress.country}</p>
                                                </div>
                                            ) : order.address ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-gray-800">{order.address.street}</p>
                                                    <p className="text-gray-600">
                                                        {order.address.city}, {order.address.state} {order.address.zipCode}
                                                    </p>
                                                    <p className="text-gray-600">{order.address.country}</p>
                                                    {order.address.phone && (
                                                        <p className="text-gray-600">Phone: {order.address.phone}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-600">No shipping address provided</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4">Order Management</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="font-medium">${order.subtotal || order.total}</span>
                                                </div>
                                                {order.shippingFee && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className="font-medium">${order.shippingFee}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                                                    <span className="font-medium text-gray-800">Total:</span>
                                                    <span className="font-bold text-lg">${order.total}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-200">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Update Status
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, "processing")}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            order.status === "processing"
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                        }`}
                                                    >
                                                        Processing
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, "shipped")}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            order.status === "shipped"
                                                                ? "bg-yellow-600 text-white"
                                                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                        }`}
                                                    >
                                                        Shipped
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, "completed")}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            order.status === "completed"
                                                                ? "bg-green-600 text-white"
                                                                : "bg-green-100 text-green-800 hover:bg-green-200"
                                                        }`}
                                                    >
                                                        Completed
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            order.status === "cancelled"
                                                                ? "bg-red-600 text-white"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                        }`}
                                                    >
                                                        Cancelled
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentOrders;
