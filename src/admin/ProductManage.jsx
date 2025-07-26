import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";
import { useAuth } from "../common/context/AuthProvider";
import StatsCard from "./StatsCard";
import { URL } from "../services/Api";

const ProductManage = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
    });
    const [topSelling, setTopSelling] = useState({
        day: { product: null, count: 0 },
        week: { product: null, count: 0 },
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Calculate pagination values
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Fetch all products and calculate stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, usersRes] = await Promise.all([
                    axios.get(`${URL}/products`),
                    axios.get(`${URL}/users`),
                ]);

                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data);
                calculateStats(productsRes.data);
                calculateTopSelling(usersRes.data, productsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load product data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate statistics
    const calculateStats = (products) => {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

        setStats({
            totalProducts,
            totalValue: totalValue.toFixed(2),
        });
    };

    // Calculate top selling products
    const calculateTopSelling = (users, products) => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Flatten all items from all orders with their dates
        const allItems = users.flatMap((user) => 
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

    // Handle search
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
        
        if (term === "") {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(
                (product) =>
                    product.name.toLowerCase().includes(term) ||
                    product.category.toLowerCase().includes(term) ||
                    product.id.toLowerCase().includes(term)
            );
            setFilteredProducts(filtered);
        }
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Open form to add new product
    const handleAddProduct = () => {
        setCurrentProduct(null);
        setShowForm(true);
    };

    // Open form to edit product
    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setShowForm(true);
    };

    // Delete product with confirmation
    const handleDeleteProduct = (productId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${URL}/products/${productId}`);
                    
                    // Update local state
                    const updatedProducts = products.filter((p) => p.id !== productId);
                    setProducts(updatedProducts);
                    setFilteredProducts(updatedProducts);
                    calculateStats(updatedProducts);
                    
                    Swal.fire("Deleted!", "The product has been deleted.", "success");
                } catch (error) {
                    console.error("Error deleting product:", error);
                    toast.error("Failed to delete product");
                }
            }
        });
    };

    // Handle form submission (add/update)
    const handleSubmit = async (productData) => {
        try {
            if (currentProduct) {
                // Update existing product
                await axios.patch(`${URL}/products/${currentProduct.id}`, productData);
                
                // Update local state
                const updatedProducts = products.map((p) =>
                    p.id === currentProduct.id ? { ...p, ...productData } : p
                );
                
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
                calculateStats(updatedProducts);
                toast.success("Product updated successfully");
            } else {
                // Add new product
                const response = await axios.post(`${URL}/products`, {
                    ...productData,
                    createdAt: new Date().toISOString(),
                });
                
                // Update local state
                const updatedProducts = [...products, response.data];
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
                calculateStats(updatedProducts);
                toast.success("Product added successfully");
            }
            
            setShowForm(false);
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error(`Failed to ${currentProduct ? "update" : "add"} product`);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search products..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiPlus className="mr-2" /> Add Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    icon="📦"
                    color="bg-blue-50 text-blue-600"
                />
                <StatsCard 
                    title="Total Inventory Value" 
                    value={`$${stats.totalValue}`} 
                    icon="💰"
                    color="bg-green-50 text-green-600"
                />
                <StatsCard 
                    title="Products Low in Stock (< 5)" 
                    value={products.filter(p => p.stock < 5).length} 
                    icon="⚠️"
                    color="bg-yellow-50 text-yellow-600"
                />
            </div>

            {/* Top Selling Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4"> Top Selling Today</h2>
                    {topSelling.day.product ? (
                        <div className="flex items-center">
                            <img
                                src={topSelling.day.product.images?.[0] || "https://via.placeholder.com/150"}
                                alt={topSelling.day.product.name}
                                className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">{topSelling.day.product.name}</p>
                                <p className="text-sm text-gray-500">Sold: {topSelling.day.count} units</p>
                                <p className="text-sm text-gray-500">Price: ${topSelling.day.product.price}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No sales today</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4"> Top Selling This Week</h2>
                    {topSelling.week.product ? (
                        <div className="flex items-center">
                            <img
                                src={topSelling.week.product.images?.[0] || "https://via.placeholder.com/150"}
                                alt={topSelling.week.product.name}
                                className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                            <div>
                                <p className="font-medium text-gray-900">{topSelling.week.product.name}</p>
                                <p className="text-sm text-gray-500">Sold: {topSelling.week.count} units</p>
                                <p className="text-sm text-gray-500">Price: ${topSelling.week.product.price}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No sales this week</p>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{product.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.images?.[0] || "https://via.placeholder.com/150"}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-md mr-3"
                                                />
                                                <span className="truncate max-w-xs">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(product.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                product.stock > 10 
                                                    ? "bg-green-100 text-green-800" 
                                                    : product.stock > 5 
                                                        ? "bg-yellow-100 text-yellow-800" 
                                                        : "bg-red-100 text-red-800"
                                            }`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors duration-150"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-150"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredProducts.length > productsPerPage && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(indexOfLastProduct, filteredProducts.length)}
                                </span>{" "}
                                of <span className="font-medium">{filteredProducts.length}</span> products
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <ProductForm 
                    product={currentProduct} 
                    onSubmit={handleSubmit} 
                    onCancel={() => setShowForm(false)} 
                />
            )}
        </div>
    );
};

export default ProductManage;