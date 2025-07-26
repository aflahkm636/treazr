import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import {
    FiPackage,
    FiDollarSign,
    FiTruck,
    FiCheckCircle,
    FiCalendar,
    FiUser,
    FiShoppingCart,
    FiCreditCard,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import OrderDistributionChart from "./OrderDistributionChart";
import StatsCard from "./StatsCard";

const OrderManage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
    });
    const [selectedOrderItems, setSelectedOrderItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Fetch all orders and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    axios.get("http://localhost:3000/users"),
                    axios.get("http://localhost:3000/products"),
                ]);

                const allOrders = usersRes.data.flatMap(
                    (user) => user.orders?.map((order) => ({ ...order, customerName: user.name })) || []
                );

                // Sort orders by date (newest first)
                const sortedOrders = allOrders.sort(
                    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );

                setOrders(sortedOrders);
                setProducts(productsRes.data);
                calculateStats(sortedOrders);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load order data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate statistics
    const calculateStats = (orders) => {
        const totalOrders = orders.length;
        const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        const shippedOrders = orders.filter((order) => order.status === "shipped").length;
        const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

        setStats({
            totalOrders,
            revenue: revenue.toFixed(2),
            shippedOrders,
            deliveredOrders,
        });
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Find which user this order belongs to
            const usersRes = await axios.get("http://localhost:3000/users");
            const userWithOrder = usersRes.data.find((user) => user.orders?.some((order) => order.id === orderId));

            if (!userWithOrder) {
                throw new Error("Order not found");
            }

            // Update the order in the user's orders
            const updatedOrders = userWithOrder.orders.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );

            // Update the user in the database
            await axios.patch(`http://localhost:3000/users/${userWithOrder.id}`, {
                orders: updatedOrders,
            });

            // Update local state
            setOrders((prevOrders) =>
                prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
            );

            // Recalculate stats
            calculateStats(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));

            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Show order items modal
    const showOrderItems = (items) => {
        setSelectedOrderItems(items);
    };

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Orders" value={stats.totalOrders} icon="📦" />
                <StatsCard title="Total Revenue" value={`$${stats.revenue}`} icon="💰" />
                <StatsCard title="Shipped Orders" value={stats.shippedOrders} icon="🚚" />
                <StatsCard title="Delivered Orders" value={stats.deliveredOrders} icon="✅" />
            </div>

            {/* Order Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiCalendar className="mr-2" /> Order Distribution
                </h2>
                <div className="h-64">
                    <OrderDistributionChart orders={orders} />
                </div>
            </div>

            {/* Order List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FiShoppingCart className="mr-2" /> Recent Orders
                    </h2>
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} of {orders.length}{" "}
                        orders
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <FiUser className="inline mr-1" /> Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <FiCalendar className="inline mr-1" /> Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <FiCreditCard className="inline mr-1" /> Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order.id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.customerName || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.date || order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => showOrderItems(order.items)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                        >
                                            {order.items.length} items
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${order.total}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                            {order.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`block w-full pl-3 pr-8 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                order.status === "pending"
                                                    ? "border-yellow-300 bg-yellow-50"
                                                    : order.status === "processing"
                                                    ? "border-blue-300 bg-blue-50"
                                                    : order.status === "shipped"
                                                    ? "border-purple-300 bg-purple-50"
                                                    : order.status === "delivered"
                                                    ? "border-green-300 bg-green-50"
                                                    : "border-red-300 bg-red-50"
                                            }`}
                                        >
                                            <option value="pending" className="bg-white">
                                                Pending
                                            </option>
                                            <option value="processing" className="bg-white">
                                                Processing
                                            </option>
                                            <option value="shipped" className="bg-white">
                                                Shipped
                                            </option>
                                            <option value="delivered" className="bg-white">
                                                Delivered
                                            </option>
                                            <option value="cancelled" className="bg-white">
                                                Cancelled
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.length > ordersPerPage && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <nav className="flex space-x-2">
                            <button
                                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <FiChevronLeft className="mr-1" /> Previous
                            </button>
                            <div className="flex space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                Next <FiChevronRight className="ml-1" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Order Items Modal */}
            {selectedOrderItems && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
                            <button
                                onClick={() => setSelectedOrderItems(null)}
                                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <ul className="divide-y divide-gray-200">
                                {selectedOrderItems.map((item, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg mr-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Quantity:</span> {item.quantity}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Price:</span> ${item.price}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">Total:</span> $
                                                        {(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t border-gray-200 p-4 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setSelectedOrderItems(null)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-150"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManage;
