// context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { URL } from "../../services/Api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    // Calculate cart count from user's cart
    const updateCartCount = useCallback(() => {
        if (user?.cart) {
            const count = user.cart.reduce((total, item) => total + (item.quantity || 1), 0);
            setCartCount(count);
        } else {
            setCartCount(0);
        }
    }, [user]);

    // Update cart count whenever user changes
    useEffect(() => {
        updateCartCount();
    }, [user, updateCartCount]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("token");
                const userData = localStorage.getItem("user");

                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await axios.get(
                `${URL}/users?email=${credentials.email}&password=${credentials.password}`
            );

            if (response.data.length === 0) {
                throw new Error("Invalid credentials");
            }

            const user = response.data[0];
            const mockToken = "mock-jwt-token";

            if (user.isBlock === true) {
                toast.error("Your account has been blocked. Please contact support.");
                return { success: false, error: "User is blocked" };
            }

            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
            updateCartCount(); // Update cart count on login

            if (user.role === "admin") {
                localStorage.setItem("loginSuccess", `Welcome Admin ${user.name || ""}!`);
                navigate("/admin");
            } else {
                localStorage.setItem("loginSuccess", `Welcome back, ${user.name || "User"}!`);
                navigate("/");
            }

            return { success: true };
        } catch (error) {
            toast.error(error.message || "Login failed");
            return { success: false, error: error.message || "Login failed" };
        }
    };

    const register = async (userData) => {
        try {
            const emailCheck = await axios.get(`${URL}/users?email=${userData.email}`);

            if (emailCheck.data.length > 0) {
                throw new Error("Email already registered");
            }

            const newUser = {
                ...userData,
                role: "user",
                isBlock: false,
                cart: [],
                orders: [],
                wishlist: [],
                created_at: new Date().toISOString(),
            };

            const response = await axios.post(`${URL}/users`, newUser);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || "Registration failed" };
        }
    };

    const logout = () => {
        Swal.fire({
            title: "Are you sure you want to logout?",
            text: "You will be logged out from your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setIsAuthenticated(false);
                setCartCount(0);

                Swal.fire("Logged Out!", "You have been logged out.", "success");
                navigate("/login");
            }
        });
    };

    const updateUserCart = async (userId, newCart) => {
        try {
            const response = await axios.patch(`${URL}/users/${userId}`, {
                cart: newCart,
            });

            const updatedUser = response.data;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Error updating cart:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                cartCount,
                login,
                register,
                logout,
                updateUserCart,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
