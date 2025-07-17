import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Register() {
    // Navigation hook for redirecting after registration
    const navigate = useNavigate();

    // State for form data with initial empty values
    const [formData, setFormData] = useState({
        name: "", // User's full name
        email: "", // Unique email (will be validated)
        password: "", // Password (should be hashed in production)
    });
    const [showPassword, setShowPassword] = useState(false);

    // State for error messages and loading status
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes and update form state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value, // Dynamically update field based on input name
        }));
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form behavior
        setIsLoading(true); // Show loading state
        setError(""); // Clear previous errors

        try {
            // 1. EMAIL VALIDATION: Check if email exists in database
            const emailCheck = await axios.get(`http://localhost:3000/users?email=${formData.email}`);

            // If email exists, throw error
            if (emailCheck.data.length > 0) {
                throw new Error("Email already registered");
            }

            // 2. USER CREATION: Prepare new user object with default values
            const newUser = {
                ...formData, // Spread existing form data
                role: "user", // Default role
                isBlock: false, // Account active by default
                cart: [], // Empty shopping cart
                orders: [], // No orders yet
                wishlist: [], // Empty wishlist
                created_at: new Date().toISOString(), // Current timestamp
            };

            // 3. API REQUEST: Submit to JSON Server
            await axios.post("http://localhost:3000/users", newUser);

            // 4. SUCCESS: Redirect to login with success state
            console.log("Navigating to login...");
            navigate("/login", {
                state: { registrationSuccess: true },
                replace: true,
            });
        } catch (err) {
            // ERROR HANDLING: Show appropriate error message
            setError(err.response?.data?.message || err.message || "Registration failed");
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="minimint" src="src/assets/logo.png" className="mx-auto h-20 w-auto" />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Registration</h2>
            </div>

            {/* Main Form Container */}
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {/* Error Message Display */}
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                {/* Registration Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                            Full Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                        </label>
                        <div className="mt-2 relative">
                            {" "}
                            {/* 👈 Make parent relative */}
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"} // 👈 Toggle input type
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 pr-12 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)} // 👈 Toggle function
                                className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {isLoading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <p className="mt-10 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
