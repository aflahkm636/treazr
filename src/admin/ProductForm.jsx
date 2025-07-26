import React, { useState, useEffect } from "react";
import { FiX, FiImage } from "react-icons/fi";

const ProductForm = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        brand: "",
        images: [],
        tags: "",
    });

    const [errors, setErrors] = useState({});

    // Initialize form with product data if editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                category: product.category || "",
                description: product.description || "",
                price: product.price || "",
                stock: product.stock || "",
                brand: product.brand || "",
                images: product.images || [],
                tags: product.tags ? product.tags.join(", ") : "",
            });
        }
    }, [product]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle image URL changes
    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({
            ...formData,
            images: newImages,
        });
    };

    // Add new image field
    const addImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, ""],
        });
    };

    // Remove image field
    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            images: newImages,
        });
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (!formData.category.trim()) newErrors.category = "Category is required";
        if (!formData.price || isNaN(formData.price) || formData.price <= 0) 
            newErrors.price = "Valid price is required";
        if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) 
            newErrors.stock = "Valid stock quantity is required";
        if (formData.images.length === 0) {
            newErrors.images = "At least one image is required";
        } else {
            formData.images.forEach((img, index) => {
                if (!img.trim()) newErrors[`image-${index}`] = "Image URL is required";
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validate()) {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
            };
            
            onSubmit(productData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {product ? "Edit Product" : "Add New Product"}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.category ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.price ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                        </div>

                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.stock ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                        </div>

                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
                        {formData.images.map((image, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <div className="mr-2 text-gray-400">
                                    <FiImage />
                                </div>
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    className={`flex-1 px-3 py-2 border ${errors[`image-${index}`] ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="Image URL"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                        <button
                            type="button"
                            onClick={addImageField}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add Another Image
                        </button>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {product ? "Update Product" : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;