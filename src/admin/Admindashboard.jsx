// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../common/context/AuthProvider";
import StatsCard from "./StatsCard";
import OrderTrendChart from "./OrderTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import OrderDistributionChart from "./OrderDistributionChart";
import { URL } from "../services/Api";

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
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

    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of the admin panel",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, logout!",
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate("/login");
            }
        });
    };

    const navigateTo = (path) => {
        navigate(`/admin/${path}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with logout button */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Treazr Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center space-x-6 md:space-x-8 py-3">
                        <div
                            onClick={() => navigateTo("users")}
                            className="text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors font-medium text-sm sm:text-base"
                        >
                            Manage Users
                        </div>
                        <div
                            onClick={() => navigateTo("products")}
                            className="text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors font-medium text-sm sm:text-base"
                        >
                            Manage Products
                        </div>
                        <div
                            onClick={() => navigateTo("orders")}
                            className="text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors font-medium text-sm sm:text-base"
                        >
                            Manage Orders
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            </main>
        </div>
    );
};

export default AdminDashboard;
