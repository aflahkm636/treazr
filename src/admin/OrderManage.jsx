import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderTrendChart from "./OrderTrendChart";
import StatsCard from "./StatsCard";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import OrderDistributionChart from "./OrderDistributionChart";

const OrderManage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
    });
    const [loading, setLoading] = useState(true);

    // Fetch all orders
    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersRes = await axios.get("http://localhost:3000/users");

                const allOrders = usersRes.data.flatMap(
                    (user) => user.orders?.map((order) => ({ ...order, customerName: user.name })) || []
                );

                // Sort orders by date (newest first)
                const sortedOrders = allOrders.sort(
                    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );

                setOrders(sortedOrders);
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

    if (loading) {
        return <div className="text-center py-8">Loading order data...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Order Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard title="Total Orders" value={stats.totalOrders} icon="📦" />
                <StatsCard title="Total Revenue" value={`$${stats.revenue}`} icon="💰" />
                <StatsCard title="Shipped Orders" value={stats.shippedOrders} icon="🚚" />
                <StatsCard title="Delivered Orders" value={stats.deliveredOrders} icon="✅" />
            </div>

            {/* Order Trend Chart */}
            <h2 className="text-lg font-medium text-gray-800 mb-4">Order Distribution</h2>
            <div className="h-64">
                <OrderDistributionChart orders={orders} />
            </div>

            {/* Order List */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{order.id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.customerName || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.date || order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.items.length} items
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {order.paymentMethod}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderManage;