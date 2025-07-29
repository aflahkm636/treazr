import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import { useTheme } from "../common/context/Darkthemeprovider";
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
    FiMoreHorizontal,
    FiX,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
} from "react-icons/fi";
import OrderDistributionChart from "./OrderDistributionChart";
import StatsCard from "./StatsCard";
import { URL } from "../services/Api";

const OrderManage = () => {
    const { darkMode } = useTheme();
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
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    });
    const [statusFilter, setStatusFilter] = useState("all"); // New state for status filter
    const ordersPerPage = 8;

    // Status colors mapping
    const statusColors = {
        pending: {
            bg: darkMode ? "bg-yellow-900" : "bg-yellow-50",
            text: darkMode ? "text-yellow-300" : "text-yellow-800",
            border: darkMode ? "border-yellow-700" : "border-yellow-200",
        },
        processing: {
            bg: darkMode ? "bg-blue-900" : "bg-blue-50",
            text: darkMode ? "text-blue-300" : "text-blue-800",
            border: darkMode ? "border-blue-700" : "border-blue-200",
        },
        shipped: {
            bg: darkMode ? "bg-purple-900" : "bg-purple-50",
            text: darkMode ? "text-purple-300" : "text-purple-800",
            border: darkMode ? "border-purple-700" : "border-purple-200",
        },
        delivered: {
            bg: darkMode ? "bg-green-900" : "bg-green-50",
            text: darkMode ? "text-green-300" : "text-green-800",
            border: darkMode ? "border-green-700" : "border-green-200",
        },
        cancelled: {
            bg: darkMode ? "bg-red-900" : "bg-red-50",
            text: darkMode ? "text-red-300" : "text-red-800",
            border: darkMode ? "border-red-700" : "border-red-200",
        },
    };

    // Payment method colors mapping
    const paymentColors = {
        credit: { bg: darkMode ? "bg-indigo-900" : "bg-indigo-50", text: darkMode ? "text-indigo-300" : "text-indigo-800" },
        paypal: { bg: darkMode ? "bg-blue-900" : "bg-blue-50", text: darkMode ? "text-blue-300" : "text-blue-800" },
        cash: { bg: darkMode ? "bg-green-900" : "bg-green-50", text: darkMode ? "text-green-300" : "text-green-800" },
        other: { bg: darkMode ? "bg-gray-700" : "bg-gray-100", text: darkMode ? "text-gray-300" : "text-gray-800" },
    };

    // Fetch all orders and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    axios.get(`${URL}/users`),
                    axios.get(`${URL}/products`),
                ]);

                const allOrders = usersRes.data.flatMap(
                    (user) =>
                        user.orders?.map((order) => ({
                            ...order,
                            customerName: user.name,
                            paymentMethod: order.paymentMethod || "credit", // Default to credit if not specified
                        })) || []
                );

                // Initial sort by date (newest first)
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

    // Sort functionality
    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getSortedOrders = (orders) => {
        const sortableOrders = [...orders];
        if (sortConfig.key) {
            sortableOrders.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === "date") {
                    aValue = a.date ? new Date(a.date) : new Date(a.createdAt);
                    bValue = b.date ? new Date(b.date) : new Date(b.createdAt);
                } else if (sortConfig.key === "total") {
                    aValue = parseFloat(a.total);
                    bValue = parseFloat(b.total);
                } else if (sortConfig.key === "customer") {
                    aValue = (a.customerName || "Unknown").toLowerCase();
                    bValue = (b.customerName || "Unknown").toLowerCase();
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableOrders;
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Find which user this order belongs to
            const usersRes = await axios.get(`${URL}/users`);
            const userWithOrder = usersRes.data.find((user) => user.orders?.some((order) => order.id === orderId));

            if (!userWithOrder) {
                throw new Error("Order not found");
            }

            // Update the order in the user's orders
            const updatedOrders = userWithOrder.orders.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );

            // Update the user in the database
            await axios.patch(`${URL}/users/${userWithOrder.id}`, {
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
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Show order items modal
    const showOrderItems = (items) => {
        setSelectedOrderItems(items);
    };

    // Filter and sort orders
    const filteredOrders = getSortedOrders(
        orders.filter(
            (order) =>
                (statusFilter === "all" || order.status === statusFilter) && // Apply status filter
                (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())))
        )
    );

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className={`flex justify-center items-center h-64 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                <div
                    className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                        darkMode ? "border-blue-400" : "border-blue-500"
                    }`}
                ></div>
            </div>
        );
    }

    return (
        <div
            className={`container mx-auto px-4 py-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
        >
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Order Management</h1>
                <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    View and manage all customer orders
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<FiPackage className="w-5 h-5" />}
                    trend="up"
                    change="12% from last month"
                    darkMode={darkMode}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.revenue}`}
                    icon={<FiDollarSign className="w-5 h-5" />}
                    trend="up"
                    change="8% from last month"
                    darkMode={darkMode}
                />
                <StatsCard
                    title="Shipped Orders"
                    value={stats.shippedOrders}
                    icon={<FiTruck className="w-5 h-5" />}
                    darkMode={darkMode}
                />
                <StatsCard
                    title="Delivered Orders"
                    value={stats.deliveredOrders}
                    icon={<FiCheckCircle className="w-5 h-5" />}
                    darkMode={darkMode}
                />
            </div>

            {/* Order Distribution Chart */}
            <div
                className={`p-6 rounded-xl shadow-sm border mb-8 transition-all duration-300 ${
                    darkMode
                        ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/20"
                        : "bg-white border-gray-100 hover:shadow-lg hover:shadow-gray-100"
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center ${darkMode ? "text-white" : "text-gray-800"}`}>
                        <FiCalendar className="mr-2" /> Order Distribution
                    </h2>
                    <button
                        className={`p-1 rounded-full ${
                            darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                        <FiMoreHorizontal />
                    </button>
                </div>
                <div className="h-64">
                    <OrderDistributionChart orders={orders} darkMode={darkMode} />
                </div>
            </div>

            {/* Order List */}
            <div
                className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${
                    darkMode
                        ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/20"
                        : "bg-white border-gray-100 hover:shadow-lg hover:shadow-gray-100"
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h2
                            className={`text-lg font-semibold flex items-center ${
                                darkMode ? "text-white" : "text-gray-800"
                            }`}
                        >
                            <FiShoppingCart className="mr-2" /> Recent Orders
                        </h2>
                    </div>
                    <div className="mt-2 sm:mt-0 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className={`px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:ring-offset-gray-800"
                                    : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:ring-offset-white"
                            }`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    darkMode
                                        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:ring-offset-gray-800"
                                        : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:ring-offset-white"
                                }`}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div
                                className={`absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                                <FiFilter className="h-4 w-4" />
                            </div>
                        </div>
                        <button
                            onClick={() => requestSort("date")}
                            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:ring-offset-gray-800"
                                    : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:ring-offset-white"
                            }`}
                        >
                            <FiCalendar className="mr-1" />
                            {sortConfig.key === "date" &&
                                (sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <tr>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Order ID
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Customer
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Date
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Items
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Amount
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    <FiCreditCard className="inline mr-1" /> Payment
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                >
                                    Status
                                </th>
                                <th
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode ? "text-gray-300" : "text-gray-500"
                                    }`}
                                ></th>
                            </tr>
                        </thead>
                        <tbody
                            className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}
                        >
                            {currentOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className={`text-center px-6 py-8 text-sm ${
                                            darkMode ? "text-gray-400" : "text-gray-500"
                                        }`}
                                    >
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <tr key={order.id} className={darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                darkMode ? "text-white" : "text-gray-900"
                                            }`}
                                        >
                                            #{order.id.slice(-6)}
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                darkMode ? "text-gray-300" : "text-gray-500"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                                        darkMode ? "bg-gray-600" : "bg-gray-200"
                                                    }`}
                                                >
                                                    <FiUser className={darkMode ? "text-gray-300" : "text-gray-500"} />
                                                </div>
                                                <div className="ml-4">
                                                    <div
                                                        className={`font-medium ${
                                                            darkMode ? "text-white" : "text-gray-900"
                                                        }`}
                                                    >
                                                        {order.customerName || "Unknown"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                darkMode ? "text-gray-300" : "text-gray-500"
                                            }`}
                                        >
                                            {formatDate(order.date || order.createdAt)}
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                darkMode ? "text-gray-300" : "text-gray-500"
                                            }`}
                                        >
                                            <button
                                                onClick={() => showOrderItems(order.items)}
                                                className={`flex items-center ${
                                                    darkMode
                                                        ? "text-blue-400 hover:text-blue-300"
                                                        : "text-blue-600 hover:text-blue-800"
                                                } hover:underline`}
                                            >
                                                {order.items.length} items
                                            </button>
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                darkMode ? "text-white" : "text-gray-900"
                                            }`}
                                        >
                                            ${order.total}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                                    paymentColors[order.paymentMethod?.toLowerCase()]?.bg ||
                                                    paymentColors.other.bg
                                                } ${
                                                    paymentColors[order.paymentMethod?.toLowerCase()]?.text ||
                                                    paymentColors.other.text
                                                }`}
                                            >
                                                {order.paymentMethod || "Credit"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    statusColors[order.status]?.bg
                                                } ${statusColors[order.status]?.text} ${
                                                    statusColors[order.status]?.border
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`block w-full pl-3 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                                                    statusColors[order.status]?.border
                                                } ${statusColors[order.status]?.bg} ${
                                                    darkMode ? "text-white" : "text-gray-900"
                                                }`}
                                            >
                                                <option value="pending" className={darkMode ? "bg-gray-800" : "bg-white"}>
                                                    Pending
                                                </option>
                                                <option
                                                    value="processing"
                                                    className={darkMode ? "bg-gray-800" : "bg-white"}
                                                >
                                                    Processing
                                                </option>
                                                <option value="shipped" className={darkMode ? "bg-gray-800" : "bg-white"}>
                                                    Shipped
                                                </option>
                                                <option value="delivered" className={darkMode ? "bg-gray-800" : "bg-white"}>
                                                    Delivered
                                                </option>
                                                <option value="cancelled" className={darkMode ? "bg-gray-800" : "bg-white"}>
                                                    Cancelled
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredOrders.length > ordersPerPage && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 space-y-3 sm:space-y-0">
                        {/* Page info */}
                        <div className={`text-sm text-center sm:text-left ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                            {filteredOrders.length} orders
                        </div>

                        {/* Pagination controls */}
                        <nav className="flex justify-center sm:justify-end space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md border text-sm font-medium flex items-center transition-colors ${
                                    darkMode
                                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                                }`}
                            >
                                <FiChevronLeft className="mr-1" /> Previous
                            </button>

                            {/* Page numbers */}
                            <div className="hidden sm:flex space-x-1">
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
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? darkMode
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-600 text-white"
                                                    : darkMode
                                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md border text-sm font-medium flex items-center transition-colors ${
                                    darkMode
                                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                                }`}
                            >
                                Next <FiChevronRight className="ml-1" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Order Items Modal */}
            {selectedOrderItems && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
                    <div
                        className={`rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl transform transition-all ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                        <div
                            className={`flex justify-between items-center border-b p-4 sticky top-0 z-10 ${
                                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                            }`}
                        >
                            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                Order Items
                            </h3>
                            <button
                                onClick={() => setSelectedOrderItems(null)}
                                className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                                    darkMode
                                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                        : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                                {selectedOrderItems.map((item, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex">
                                            <div
                                                className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden ${
                                                    darkMode ? "bg-gray-700" : "bg-gray-100"
                                                }`}
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FiPackage
                                                            className={`w-6 h-6 ${
                                                                darkMode ? "text-gray-500" : "text-gray-400"
                                                            }`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                    {item.name}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                    <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                                                        <span className="font-medium">Qty:</span> {item.quantity}
                                                    </div>
                                                    <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                                                        <span className="font-medium">Price:</span> ${item.price}
                                                    </div>
                                                    <div
                                                        className={`col-span-2 ${
                                                            darkMode ? "text-gray-300" : "text-gray-700"
                                                        }`}
                                                    >
                                                        <span className="font-medium">Total:</span> $
                                                        {(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div
                            className={`border-t p-4 sticky bottom-0 ${
                                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                            }`}
                        >
                            <button
                                onClick={() => setSelectedOrderItems(null)}
                                className={`w-full py-2 px-4 rounded-md transition duration-150 ${
                                    darkMode
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
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
