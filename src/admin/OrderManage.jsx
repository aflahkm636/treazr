import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import OrderTrendChart from "./OrderTrendChart";
import StatsCard from "./StatsCard";
import { toast } from "react-toastify";
import { useAuth } from "../common/context/AuthProvider";
import OrderDistributionChart from "./OrderDistributionChart";

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
    const [topSelling, setTopSelling] = useState({
        day: { product: null, count: 0 },
        week: { product: null, count: 0 },
    });
    const [selectedOrderItems, setSelectedOrderItems] = useState(null);
    const [loading, setLoading] = useState(true);

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
                calculateTopSelling(sortedOrders, productsRes.data);
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

    // Calculate top selling products
    const calculateTopSelling = (orders, products) => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Flatten all items from all orders with their dates
        const allItems = orders.flatMap((order) => {
            const orderDate = new Date(order.date || order.createdAt);
            return order.items.map((item) => ({
                ...item,
                date: orderDate,
            }));
        });

        // Calculate daily top seller
        const todayItems = allItems.filter((item) => item.date.toDateString() === today.toDateString());
        const todayProductCount = countProducts(todayItems);
        const todayTop = findTopProduct(todayProductCount, products);

        // Calculate weekly top seller
        const weekItems = allItems.filter((item) => item.date >= oneWeekAgo);
        const weekProductCount = countProducts(weekItems);
        const weekTop = findTopProduct(weekProductCount, products);

        setTopSelling({
            day: todayTop,
            week: weekTop,
        });
    };

    // Helper to count products
    const countProducts = (items) => {
        const countMap = {};
        items.forEach((item) => {
            countMap[item.productId] = (countMap[item.productId] || 0) + item.quantity;
        });
        return countMap;
    };

    // Helper to find top product
    const findTopProduct = (productCount, products) => {
        let topProductId = null;
        let topCount = 0;

        Object.entries(productCount).forEach(([productId, count]) => {
            if (count > topCount) {
                topProductId = productId;
                topCount = count;
            }
        });

        const product = products.find((p) => p.id === topProductId);
        return {
            product,
            count: topCount,
        };
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

            {/* Top Selling Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Top Selling Today</h2>
                    {topSelling.day.product ? (
                        <div className="flex items-center">
                            <img
                                src={topSelling.day.product.image}
                                alt={topSelling.day.product.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                                <p className="font-medium">{topSelling.day.product.name}</p>
                                <p>Sold: {topSelling.day.count} units</p>
                                <p>Price: ${topSelling.day.product.price}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No sales today</p>
                    )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Top Selling This Week</h2>
                    {topSelling.week.product ? (
                        <div className="flex items-center">
                            <img
                                src={topSelling.week.product.image}
                                alt={topSelling.week.product.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                                <p className="font-medium">{topSelling.week.product.name}</p>
                                <p>Sold: {topSelling.week.count} units</p>
                                <p>Price: ${topSelling.week.product.price}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No sales this week</p>
                    )}
                </div>
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
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 cursor-pointer hover:underline"
                                        onClick={() => showOrderItems(order.items)}
                                    >
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

            {/* Order Items Modal */}
            {selectedOrderItems && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Order Items</h3>
                            <button
                                onClick={() => setSelectedOrderItems(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {selectedOrderItems.map((item, index) => (
                                <li key={index} className="py-4">
                                    <div className="flex items-center">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded mr-4"
                                        />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ${item.price} each</p>
                                            <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManage;
