import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../common/context/AuthProvider";
import axios from "axios";
import {
    FaUser,
    FaHeart,
    FaBoxOpen,
    FaEdit,
    FaChevronRight,
    FaCalendarAlt,
    FaEnvelope,
    FaShoppingBag,
} from "react-icons/fa";
import { URL } from "../../services/Api";

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;

            try {
                const response = await axios.get(`${URL}/users/${user.id}`);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );

    if (!user)
        return (
            <div className="text-center py-16">
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Please login to view your profile</h2>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 mt-10">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                                <FaUser className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-indigo-100">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/profile/edit")}
                            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/20"
                        >
                            <FaEdit className="text-sm" />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - User Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Personal Info Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaUser className="text-indigo-600 mr-2" />
                            Personal Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <FaEnvelope className="text-gray-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FaCalendarAlt className="text-gray-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Member Since</p>
                                    <p className="font-medium">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate("/wishlist")}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <FaHeart className="text-indigo-600" />
                                    <span>Wishlist</span>
                                </div>
                                <FaChevronRight className="text-gray-400" />
                            </button>
                            <button
                                onClick={() => navigate("/vieworder")}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <FaBoxOpen className="text-purple-600" />
                                    <span>My Orders</span>
                                </div>
                                <FaChevronRight className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-2">
                    {/* Recent Orders Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FaShoppingBag className="text-indigo-600 mr-2" />
                                Recent Orders
                            </h2>
                        </div>

                        {user.orders?.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {user.orders.slice(0, 3).map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/orderstatus/${order.id}`)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="mb-3 sm:mb-0">
                                                <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(order.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        order.status === "delivered"
                                                            ? "bg-green-100 text-green-800"
                                                            : order.status === "shipped"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                                    {Number(order.total).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center text-sm text-gray-500">
                                            <span>
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">You haven't placed any orders yet</p>
                                <button
                                    onClick={() => navigate("/products")}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Browse Products
                                </button>
                            </div>
                        )}

                        {user.orders?.length > 3 && (
                            <div className="p-4 border-t border-gray-100 text-center">
                                <button
                                    onClick={() => navigate("/vieworder")}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    View all orders ({user.orders.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
