// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../services/Api";
import StatsCard from "./StatsCard";
import OrderTrendChart from "./OrderTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import OrderDistributionChart from "./OrderDistributionChart";
import Loading from "../common/components/Loading";
import { useTheme } from "../common/context/Darkthemeprovider";

const AdminDashboard = () => {
    const { darkMode } = useTheme();
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    axios.get(`${URL}/users`),
                    axios.get(`${URL}/products`),
                ]);

                // Calculate total orders and revenue
                let totalOrders = 0;
                let totalRevenue = 0;
                const allOrders = [];

                usersRes.data.forEach((user) => {
                    totalOrders += user.orders?.length || 0;
                    user.orders?.forEach((order) => {
                        allOrders.push(order);
                        totalRevenue += parseFloat(order.total) || 0;
                    });
                });

                setOrders(allOrders);
                setStats({
                    users: usersRes.data.length,
                    products: productsRes.data.length,
                    orders: totalOrders,
                    revenue: parseFloat(totalRevenue.toFixed(2)),
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Loading name="admin dashboard" />;
    }

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"}`}>
            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>DashBoard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                <StatsCard title="Total Users" value={stats.users} icon="👥" darkMode={darkMode} />
                <StatsCard title="Total Products" value={stats.products} icon="🛍️" darkMode={darkMode} />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders}
                    icon="📦"
                    darkMode={darkMode}
                    trend="up"
                    change="12% from last month"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.revenue}`}
                    icon="💰"
                    darkMode={darkMode}
                    trend="up"
                    change="8% from last month"
                />
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h2 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>Order Trend</h2>
                    <div className="h-64">
                        <OrderTrendChart orders={orders} darkMode={darkMode} />
                    </div>
                </div>
                <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h2 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>
                        Revenue Trend
                    </h2>
                    <div className="h-64">
                        <RevenueTrendChart orders={orders} darkMode={darkMode} />
                    </div>
                </div>
                <div className={`p-4 rounded-lg shadow lg:col-span-2 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h2 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"} mb-4`}>
                        Order Distribution
                    </h2>
                    <div className="h-64">
                        <OrderDistributionChart orders={orders} darkMode={darkMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
