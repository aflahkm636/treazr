import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

const ViewOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (isAuthenticated && user) {
                    const response = await axios.get(`http://localhost:3000/users/${user.id}`);
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
                return "text-orange-500";
            case "processing":
                return "text-blue-500";
            case "shipped":
                return "text-lime-500";
            case "delivered":
                return "text-green-600";
            case "cancelled":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

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
                    {orders.map((order) => (
                        <div key={order.id || order.orderId} className="border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between border-b pb-4 mb-4">
                                <span className="font-semibold text-gray-700">Order #{order.id || order.orderId}</span>
                                <span className="text-gray-500">
                                    {new Date(order.date || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="font-medium text-gray-600">Total: </span>
                                    <span className="text-gray-800">${Number(order.total || 0).toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Status: </span>
                                    <span className={`font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status || "Pending"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Products:</h4>
                                <div className="divide-y">
                                    {order.products?.map((product) => (
                                        <div key={product.id} className="py-2">
                                            <div className="font-semibold text-gray-800">{product.name}</div>
                                            <div className="text-sm text-gray-500">Quantity: {product.quantity || 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewOrders;
