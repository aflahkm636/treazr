import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../common/context/Darkthemeprovider";
import { toast } from "react-toastify";
import { URL } from "../services/Api";

const TopSellingProducts = ({ darkMode }) => {
    const [topSelling, setTopSelling] = useState({
        day: { product: null, count: 0 },
        week: { product: null, count: 0 },
    });
    const [loading, setLoading] = useState(true);

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

    // Calculate top selling products
    const calculateTopSelling = async () => {
        try {
            const [productsRes, usersRes] = await Promise.all([
                axios.get(`${URL}/products`),
                axios.get(`${URL}/users`),
            ]);

            const today = new Date();
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Flatten all items from all orders with their dates
            const allItems = usersRes.data.flatMap(
                (user) =>
                    user.orders?.flatMap((order) => {
                        const orderDate = new Date(order.date || order.createdAt);
                        return order.items.map((item) => ({
                            ...item,
                            date: orderDate,
                        }));
                    }) || []
            );

            // Calculate daily top seller
            const todayItems = allItems.filter((item) => item.date.toDateString() === today.toDateString());
            const todayProductCount = countProducts(todayItems);
            const todayTop = findTopProduct(todayProductCount, productsRes.data);

            // Calculate weekly top seller
            const weekItems = allItems.filter((item) => item.date >= oneWeekAgo);
            const weekProductCount = countProducts(weekItems);
            const weekTop = findTopProduct(weekProductCount, productsRes.data);

            setTopSelling({
                day: todayTop,
                week: weekTop,
            });
        } catch (error) {
            console.error("Error calculating top selling products:", error);
            toast.error("Failed to load top selling data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculateTopSelling();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="animate-pulse h-24"></div>
                </div>
                <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="animate-pulse h-24"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Top Selling Today</h2>
                {topSelling.day.product ? (
                    <div className="flex items-center">
                        <img
                            src={topSelling.day.product.images?.[0] || "https://via.placeholder.com/150"}
                            alt={topSelling.day.product.name}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                            <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{topSelling.day.product.name}</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sold: {topSelling.day.count} units</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Price: ${topSelling.day.product.price}</p>
                        </div>
                    </div>
                ) : (
                    <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No sales today</p>
                )}
            </div>

            <div className={`p-6 rounded-xl shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Top Selling This Week</h2>
                {topSelling.week.product ? (
                    <div className="flex items-center">
                        <img
                            src={topSelling.week.product.images?.[0] || "https://via.placeholder.com/150"}
                            alt={topSelling.week.product.name}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                            <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{topSelling.week.product.name}</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sold: {topSelling.week.count} units</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Price: ${topSelling.week.product.price}</p>
                        </div>
                    </div>
                ) : (
                    <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No sales this week</p>
                )}
            </div>
        </div>
    );
};

export default TopSellingProducts;