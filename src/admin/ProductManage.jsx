import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";
import { useAuth } from "../common/context/AuthProvider";
import { useTheme } from "../common/context/Darkthemeprovider";
import StatsCard from "./StatsCard";
import TopSellingProducts from "./TopSellingProducts";
import { URL } from "../services/Api";

// New SortDropdown component
const SortDropdown = ({ darkMode, onSortChange }) => {
  const sortOptions = [
    { value: "all", label: "All Categories" },
    { value: "comics", label: "Comics" },
    { value: "action-figure", label: "action-figure" },
    { value: "Diecast Cars", label: "Diecast Cars" },
    { value: "Trading Cards", label: "Trading Cards" },
  ];

  return (
    <select
      onChange={(e) => onSortChange(e.target.value)}
      className={`block w-full sm:w-64 pl-3 pr-10 py-2 border rounded-md leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
      }`}
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const ProductManage = () => {
    const { darkMode } = useTheme();
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
                const productsRes = await axios.get(`${URL}/products`);
                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data);
                calculateStats(productsRes.data);
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
        const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

        setStats({
            totalProducts,
            totalValue: totalValue.toFixed(2),
        });
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

    // Handle sort by category
    const handleSortByCategory = (category) => {
        setCurrentPage(1); // Reset to first page when sorting
        
        if (category === "all") {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(
                (product) => product.category.toLowerCase() === category.toLowerCase()
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
                const updatedProducts = products.map((p) => (p.id === currentProduct.id ? { ...p, ...productData } : p));

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
            <div className={`flex justify-center items-center h-64 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? "border-blue-400" : "border-blue-500"}`}></div>
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Product Management</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-64">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className={darkMode ? "text-gray-400" : "text-gray-400"} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search products..."
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                                    darkMode
                                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                                }`}
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
                    darkMode={darkMode}
                    color={darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-600"}
                />
                <StatsCard
                    title="Total Inventory Value"
                    value={`$${stats.totalValue}`}
                    icon="💰"
                    darkMode={darkMode}
                    color={darkMode ? "bg-green-900 text-green-200" : "bg-green-50 text-green-600"}
                />
                <StatsCard
                    title="Products Low in Stock (< 5)"
                    value={products.filter((p) => p.stock < 5).length}
                    icon="⚠️"
                    darkMode={darkMode}
                    color={darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-50 text-yellow-600"}
                />
            </div>

            {/* Top Selling Products */}
            <TopSellingProducts darkMode={darkMode} />

            {/* Sort and Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="w-full sm:w-64">
                    <SortDropdown darkMode={darkMode} onSortChange={handleSortByCategory} />
                </div>
                <div className="w-full sm:w-64">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className={darkMode ? "text-gray-400" : "text-gray-400"} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search products..."
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className={`shadow-sm rounded-xl border overflow-hidden mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    ID
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Product
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Added On
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Category
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Price
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Stock
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <tr key={product.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                            #{product.id}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                            <div className="flex items-center">
                                                <img
                                                    src={product.images?.[0] || "https://via.placeholder.com/150"}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-md mr-3"
                                                />
                                                <span className="truncate max-w-xs">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                            {formatDate(product.createdAt)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"} capitalize`}>
                                            {product.category}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    product.stock > 10
                                                        ? darkMode
                                                            ? "bg-green-900 text-green-200"
                                                            : "bg-green-100 text-green-800"
                                                        : product.stock > 5
                                                        ? darkMode
                                                            ? "bg-yellow-900 text-yellow-200"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        : darkMode
                                                            ? "bg-red-900 text-red-200"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className={`p-1 rounded-md transition-colors duration-150 ${
                                                        darkMode
                                                            ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900"
                                                            : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                                    }`}
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className={`p-1 rounded-md transition-colors duration-150 ${
                                                        darkMode
                                                            ? "text-red-400 hover:text-red-300 hover:bg-red-900"
                                                            : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                                    }`}
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
                                    <td colSpan="7" className={`px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {filteredProducts.length > productsPerPage && (
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 mt-6 border-t sm:px-6 rounded-b-xl space-y-3 sm:space-y-0 ${
                        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                        {/* Product Range Text */}
                        <div className={`text-sm text-center sm:text-left ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Showing <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{indexOfFirstProduct + 1}</span> to{" "}
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of{" "}
                            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{filteredProducts.length}</span> products
                        </div>

                        {/* Pagination Controls */}
                        <nav className="flex justify-center sm:justify-end space-x-2" aria-label="Pagination">
                            {/* Previous Button */}
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md border text-sm font-medium flex items-center ${
                                    darkMode
                                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                }`}
                            >
                                <FiChevronLeft className="mr-1" /> Previous
                            </button>

                            {/* Page Numbers (Only on sm and up) */}
                            <div className="hidden sm:flex space-x-1">
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
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? darkMode
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-600 text-white"
                                                    : darkMode
                                                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md border text-sm font-medium flex items-center ${
                                    darkMode
                                        ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                }`}
                            >
                                Next <FiChevronRight className="ml-1" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <ProductForm 
                    product={currentProduct} 
                    onSubmit={handleSubmit} 
                    onCancel={() => setShowForm(false)}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
};

export default ProductManage;