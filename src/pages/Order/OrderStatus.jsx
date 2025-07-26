import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../common/context/AuthProvider";
import { URL } from "../../services/Api";

const OrderStatus = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const userResponse = await axios.get(`${URL}/users/${user.id}`);
                setUser(userResponse.data);

                const foundOrder = userResponse.data.orders.find((o) => o.id === orderId);
                setOrder(foundOrder || null);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching order details:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id, orderId]);

    if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;
    if (!order) return <div className="text-center text-red-600 py-10">Order not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative mt-15">
            {/* Back Home Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
                Back Home
            </button>

            <h2 className="text-3xl font-bold mb-6 text-gray-800 font-serif">Order Details</h2>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Order Info</h3>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Order Date:</strong> {new Date(order.date).toLocaleString()}</p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${order.status === 'delivered' ? 'green' : 'yellow'}-100 text-${order.status === 'delivered' ? 'green' : 'yellow'}-800`}>
                        {order.status}
                    </span>
                </p>
                <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
                <p><strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Shipping Address</h3>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Order Items</h3>
                {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b last:border-b-0">
                        <div className="flex items-center space-x-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                            <div>
                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                <p className="text-gray-600 text-sm">${item.price.toFixed(2)} x {item.quantity}</p>
                            </div>
                        </div>
                        <div className="text-right font-semibold text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderStatus;
