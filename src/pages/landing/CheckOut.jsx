import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../common/context/AuthProvider";

const Checkout = () => {
    const { user, setUser } = useAuth();
    const userId = user?.id;
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", zip: "", country: "" });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [useExistingAddress, setUseExistingAddress] = useState(true);

    useEffect(() => {
       if (!userId) return;
        const fetchData = async () => {
            try {
                const [userResponse, productsResponse] = await Promise.all([
                    axios.get(`http://localhost:3000/users/${userId}`),
                    axios.get("http://localhost:3000/products"),
                ]);
                setUser(userResponse.data);
                setProducts(productsResponse.data);
                if (userResponse.data.shippingAddresses?.length > 0) {
                    setSelectedAddress(userResponse.data.shippingAddresses[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleAddressChange = (e) => setSelectedAddress(JSON.parse(e.target.value));
    const handleNewAddressChange = (e) => setNewAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePaymentMethodChange = (e) => setPaymentMethod(e.target.value);

    const calculateTotal = () =>
        user?.cart?.reduce((total, item) => {
            const product = products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0) || 0;

    const handleQuantityChange = async (productId, newQty) => {
        try {
            const product = products.find((p) => p.id === productId);
            if (!product || newQty < 1 || newQty > product.stock) return;
            const updatedCart = user.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: newQty } : item
            );
            await axios.patch(`http://localhost:3000/users/${userId}`, { cart: updatedCart });
            setUser((prev) => ({ ...prev, cart: updatedCart }));
        } catch (error) {
            console.error("Error updating quantity:", error);
            Swal.fire("Error", "Failed to update quantity", "error");
        }
    };

    const handlePlaceOrder = async () => {
        try {
            for (const cartItem of user.cart) {
                const product = products.find((p) => p.id === cartItem.productId);
                if (!product || product.stock < cartItem.quantity) {
                    Swal.fire("Error", `Not enough stock for ${product?.name || "an item"}`, "error");
                    return;
                }
            }
            const shippingAddress = useExistingAddress ? selectedAddress : newAddress;
            const orderItems = user.cart.map((cartItem) => {
                const product = products.find((p) => p.id === cartItem.productId);
                return {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    image: product.images[0],
                };
            });
            const order = {
                id: Date.now().toString(),
                items: orderItems,
                total: calculateTotal(),
                shippingAddress,
                paymentMethod,
                status: "processing",
                date: new Date().toISOString(),
            };
            await axios.patch(`http://localhost:3000/users/${userId}`, {
                orders: [...user.orders, order],
                cart: [],
                shippingAddresses: [...(user.shippingAddresses || []), shippingAddress],
            });
            for (const item of user.cart) {
                const product = products.find((p) => p.id === item.productId);
                await axios.patch(`http://localhost:3000/products/${item.productId}`, {
                    stock: product.stock - item.quantity,
                });
            }
            Swal.fire({
                title: "Order Placed!",
                text: "Your order has been placed successfully",
                icon: "success",
                confirmButtonText: "View Order",
            }).then(() => navigate(`/orderstatus/${order.id}`));
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire("Error", "Failed to place order", "error");
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!user) return <div className="text-center text-red-500">User not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Shipping Info */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={useExistingAddress}
                                    onChange={() => setUseExistingAddress(true)}
                                />
                                Existing Address
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={!useExistingAddress}
                                    onChange={() => setUseExistingAddress(false)}
                                />
                                New Address
                            </label>
                        </div>

                        {useExistingAddress ? (
                            user.shippingAddresses?.length ? (
                                <select
                                    value={JSON.stringify(selectedAddress)}
                                    onChange={handleAddressChange}
                                    className="w-full p-2 border rounded"
                                >
                                    {user.shippingAddresses.map((address, i) => (
                                        <option key={i} value={JSON.stringify(address)}>
                                            {`${address.street}, ${address.city}, ${address.state} ${address.zip}`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p>No saved addresses. Please add a new one.</p>
                            )
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["street", "city", "state", "zip", "country"].map((field) => (
                                    <input
                                        key={field}
                                        type="text"
                                        name={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={newAddress[field]}
                                        onChange={handleNewAddressChange}
                                        className="p-2 border rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                        <div className="flex flex-col gap-2">
                            {["cod", "card", "upi", "netbanking"].map((method) => (
                                <label key={method} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    {method.toUpperCase()}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 shadow rounded space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Order Summary</h3>

                    {user.cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        user.cart.map((item) => {
                            const product = products.find((p) => p.id === item.productId);
                            return product ? (
                                <div key={item.productId} className="flex items-center gap-4">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-600">
                                            ${product.price.toFixed(2)} x {item.quantity}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="px-2 bg-gray-200 rounded"
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= product.stock}
                                                className="px-2 bg-gray-200 rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-medium">${(product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ) : null;
                        })
                    )}

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={user.cart.length === 0}
                            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
