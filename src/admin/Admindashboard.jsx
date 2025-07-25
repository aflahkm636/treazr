// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../services/Api";
import StatsCard from "./StatsCard";
import OrderTrendChart from "./OrderTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import OrderDistributionChart from "./OrderDistributionChart";

const AdminDashboard = () => {
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
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Users" value={stats.users} icon="👥" />
                <StatsCard title="Total Products" value={stats.products} icon="🛍️" />
                <StatsCard title="Total Orders" value={stats.orders} icon="📦" />
                <StatsCard title="Total Revenue" value={`$${stats.revenue}`} icon="💰" />
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Order Trend</h2>
                    <div className="h-64">
                        <OrderTrendChart orders={orders} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue Trend</h2>
                    <div className="h-64">
                        <RevenueTrendChart orders={orders} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Order Distribution</h2>
                    <div className="h-64">
                        <OrderDistributionChart orders={orders} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;