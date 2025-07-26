import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../common/context/AuthProvider";
import { FaHome } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import PaymentMethods from "../../common/components/Payment";
import Loading from "../../common/components/Loading";
import { URL } from "../../services/Api";

// Address validation schema
const addressValidationSchema = Yup.object().shape({
    street: Yup.string().required("Street address is required").min(5, "Street address must be at least 5 characters"),
    city: Yup.string()
        .required("City is required")
        .matches(/^[a-zA-Z\s]*$/, "City can only contain letters"),
    state: Yup.string()
        .required("State is required")
        .matches(/^[a-zA-Z\s]*$/, "State can only contain letters"),
    zip: Yup.string()
        .required("ZIP code is required")
        .matches(/^\d{6}$/, "ZIP code must be 6 digits"),
    country: Yup.string().required("Country is required"),
});

const Checkout = () => {
    const location = useLocation();
    const { user, setUser } = useAuth();
    const userId = user?.id;
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [useExistingAddress, setUseExistingAddress] = useState(true);
    const [cardType, setCardType] = useState("credit");
    const [upiProvider, setUpiProvider] = useState("googlepay");
    const [shippingFee, setShippingFee] = useState(0);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const [buyNowProduct, setBuyNowProduct] = useState(null);

    // Formik form for new address
    const addressForm = useFormik({
        initialValues: {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
        },
        validationSchema: addressValidationSchema,
        onSubmit: async (values) => {
            await saveAddress(values);
        },
    });

    useEffect(() => {
        if (location.state?.fromBuyNow) {
            setIsBuyNow(true);
            setBuyNowProduct(location.state.cartItems[0]);
        }
    }, [location.state]);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                const [userResponse, productsResponse] = await Promise.all([
                    axios.get(`${URL}/users/${userId}`),
                    axios.get(`${URL}/products`),
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

    useEffect(() => {
        setShippingFee(paymentMethod === "cod" ? 5 : 0);
    }, [paymentMethod]);

    const handleAddressChange = (e) => setSelectedAddress(JSON.parse(e.target.value));

    const calculateSubtotal = () => {
        if (isBuyNow && buyNowProduct) {
            return buyNowProduct.price * buyNowProduct.quantity;
        }
        return (
            user?.cart?.reduce((total, item) => {
                const product = products.find((p) => p.id === item.productId);
                return total + (product ? product.price * item.quantity : 0);
            }, 0) || 0
        );
    };

    const calculateTotal = () => (calculateSubtotal() + shippingFee).toFixed(2);

    const saveAddress = async (address) => {
        try {
            const updatedUser = await axios.patch(`${URL}/users/${userId}`, {
                shippingAddresses: [...(user.shippingAddresses || []), address],
            });
            setUser(updatedUser.data);
            setSelectedAddress(address);
            setUseExistingAddress(true);
            addressForm.resetForm();
            Swal.fire("Success", "Address saved successfully", "success");
        } catch (error) {
            console.error("Error saving address:", error);
            Swal.fire("Error", "Failed to save address", "error");
        }
    };

    const handlePlaceOrder = async () => {
        try {
            const shippingAddress = useExistingAddress ? selectedAddress : addressForm.values;

            if (!useExistingAddress) {
                try {
                    await addressForm.validateForm();
                    if (Object.keys(addressForm.errors).length > 0) {
                        throw new Error("Address validation failed");
                    }
                } catch (error) {
                    Swal.fire("Error", "Please fill all address fields correctly", "error");
                    return;
                }
            }

            if (useExistingAddress && !selectedAddress) {
                Swal.fire("Error", "Please select a shipping address", "error");
                return;
            }

            let orderItems;
            if (isBuyNow && buyNowProduct) {
                orderItems = [
                    {
                        productId: buyNowProduct.productId,
                        name: buyNowProduct.name,
                        price: buyNowProduct.price,
                        quantity: buyNowProduct.quantity,
                        image: buyNowProduct.image,
                    },
                ];
            } else {
                orderItems = user.cart.map((cartItem) => {
                    const product = products.find((p) => p.id === cartItem.productId);
                    return {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: cartItem.quantity,
                        image: product.images[0],
                    };
                });
            }

            const order = {
                id: Date.now().toString(),
                items: orderItems,
                subtotal: calculateSubtotal(),
                shippingFee,
                total: calculateTotal(),
                shippingAddress,
                paymentMethod,
                paymentDetails:
                    paymentMethod === "card"
                        ? { type: cardType }
                        : paymentMethod === "upi"
                        ? { provider: upiProvider }
                        : {},
                status: "processing",
                date: new Date().toISOString(),
                isBuyNow: isBuyNow,
            };
            for (const item of orderItems) {
                const product = products.find((p) => p.id === item.productId.toString());

                if (product) {
                    const updatedStock = product.stock - item.quantity;

                    if (updatedStock < 0) {
                        Swal.fire("Error", `Not enough stock for ${product.name}`, "error");
                        return;
                    }

                    await axios.patch(`${URL}/products/${product.id}`, {
                        stock: updatedStock,
                    });
                }
            }
            const updateData = {
                orders: [...(user.orders || []), order],
                shippingAddresses: [...(user.shippingAddresses || []), shippingAddress].filter(
                    (addr, index, self) => index === self.findIndex((a) => JSON.stringify(a) === JSON.stringify(addr))
                ),
            };

            if (!isBuyNow) {
                updateData.cart = [];
            }

            await axios.patch(`${URL}/users/${userId}`, updateData);

            const updatedUser = {
                ...user,
                orders: [...(user.orders || []), order],
                ...(!isBuyNow && { cart: [] }),
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
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

    if (loading) {
        return <Loading name="checkout" />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-xl">Please login to proceed with checkout</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Complete Your Purchase</h1>
                    <p className="mt-2 text-gray-600">Review your order details before payment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping and Payment Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Address Section */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center mb-6">
                                <FaHome className="text-indigo-600 mr-3 text-xl" />
                                <h2 className="text-xl font-serif font-semibold text-gray-800">Shipping Information</h2>
                            </div>

                            <div className="flex gap-6 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        checked={useExistingAddress}
                                        onChange={() => setUseExistingAddress(true)}
                                    />
                                    <span className="font-medium">Use Saved Address</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        checked={!useExistingAddress}
                                        onChange={() => setUseExistingAddress(false)}
                                    />
                                    <span className="font-medium">New Address</span>
                                </label>
                            </div>

                            {useExistingAddress ? (
                                user.shippingAddresses?.length ? (
                                    <select
                                        value={JSON.stringify(selectedAddress)}
                                        onChange={handleAddressChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {user.shippingAddresses.map((address, i) => (
                                            <option key={i} value={JSON.stringify(address)}>
                                                {`${address.street}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-gray-500">No saved addresses found.</p>
                                )
                            ) : (
                                <form onSubmit={addressForm.handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {["street", "city", "state", "zip", "country"].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                    {addressForm.touched[field] && addressForm.errors[field] ? (
                                                        <span className="text-red-500 text-xs ml-1">
                                                            {addressForm.errors[field]}
                                                        </span>
                                                    ) : null}
                                                </label>
                                                <input
                                                    type={field === "zip" ? "text" : "text"}
                                                    name={field}
                                                    placeholder={
                                                        field === "zip"
                                                            ? "PIN Code"
                                                            : field.charAt(0).toUpperCase() + field.slice(1)
                                                    }
                                                    value={addressForm.values[field]}
                                                    onChange={addressForm.handleChange}
                                                    onBlur={addressForm.handleBlur}
                                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                                        addressForm.touched[field] && addressForm.errors[field]
                                                            ? "border-red-500"
                                                            : "border-gray-200"
                                                    }`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Save This Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                addressForm.resetForm();
                                                setUseExistingAddress(true);
                                            }}
                                            className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Payment Methods Component */}
                        <PaymentMethods
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            cardType={cardType}
                            setCardType={setCardType}
                            upiProvider={upiProvider}
                            setUpiProvider={setUpiProvider}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-xl font-serif font-semibold mb-6 text-gray-800">Order Summary</h2>

                            {isBuyNow && buyNowProduct ? (
                                <>
                                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                                        <div className="py-4 flex items-center">
                                            <img
                                                src={buyNowProduct.image}
                                                alt={buyNowProduct.name}
                                                className="w-16 h-16 object-cover rounded-lg mr-4"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{buyNowProduct.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    ${buyNowProduct.price.toFixed(2)} × {buyNowProduct.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium whitespace-nowrap ml-2">
                                                ${(buyNowProduct.price * buyNowProduct.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>${(buyNowProduct.price * buyNowProduct.quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>${shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span>${calculateTotal()}</span>
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={
                                                (useExistingAddress && !selectedAddress) ||
                                                (!useExistingAddress && !addressForm.isValid) ||
                                                (buyNowProduct.stock && buyNowProduct.quantity > buyNowProduct.stock)
                                            }
                                            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </>
                            ) : user.cart.length === 0 ? (
                                <p className="text-gray-500">Your cart is empty.</p>
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                                        {user.cart.map((item) => {
                                            const product = products.find((p) => p.id === item.productId);
                                            return product ? (
                                                <div key={item.productId} className="py-4 flex items-center">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg mr-4"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{product.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            ${product.price.toFixed(2)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium whitespace-nowrap ml-2">
                                                        ${(product.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>${calculateSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>${shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span>${calculateTotal()}</span>
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={
                                                user.cart.length === 0 ||
                                                (useExistingAddress && !selectedAddress) ||
                                                (!useExistingAddress && !addressForm.isValid)
                                            }
                                            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
