// components/Register.js
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../common/context/AuthProvider';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await register(formData);
    if (result.success) {
      navigate('/login', { state: { registrationSuccess: true } });
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
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
