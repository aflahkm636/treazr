import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import Wishlist from "./pages/Wishlist";
import Landing from "./pages/landing/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ErrorResponse from "./pages/Errorresponse";
import NavBar2 from "./common/layout/Navbar2";
import { useAuth } from "./common/context/AuthProvider";
import TopRated from "./pages/landing/Toprated";
import Newest from "./pages/landing/Newest";
import ProductDetails from "./common/components/ProductDetails";
import Footer from "./common/layout/Footer";
import Cart from "./pages/Cart";
import OrderDetails from "./pages/Order/OrderDetails";
import ProductList from "./pages/products/ProductList";
import DiecastCars from "./pages/products/DiecastCars";
import Comics from "./pages/products/Comics";
import ActionFigures from "./pages/products/ActionFigures";
import TradingCards from "./pages/products/TradingCards";
import CheckOut from "./pages/Order/CheckOut";
import OrderStatus from "./pages/Order/OrderStatus";
import ViewOrders from "./common/components/ViewOrders";
import Profile from "./common/components/Profile";
import BuyNow from "./common/components/BuyNow";
import AdminLayout from "./admin/AdminLayout";
import OrderManage from "./admin/OrderManage";
import ProductManage from "./admin/ProductManage";
import ManageUser from "./admin/ManageUser";
import AdminDashboard from "./admin/Admindashboard";

// ✅ Lazy loaded components
const Products = lazy(() => import("./pages/products/Products"));

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const RoutesWrapper = () => {
    const location = useLocation();
    const hideNavbar = ["/login", "/register"].includes(location.pathname) || location.pathname.startsWith("/admin");
    const hideFooter =
        ["/login", "/register", "/cart", "/wishlist", "/profile", "/checkout"].includes(location.pathname) ||
        location.pathname.startsWith("/admin");

    return (
        <>
            {!hideNavbar && <NavBar2 />}
            <main>
                {/*  Wrap entire Routes in <Suspense /> */}
                <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
                    <Routes>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<ManageUser />} />
                            <Route path="products" element={<ProductManage />} />
                            <Route path="orders" element={<OrderManage />} />
                        </Route>
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />

                        <Route path="/" element={<Landing />}>
                            <Route index element={<TopRated />} />
                            <Route path="top-rated" element={<TopRated />} />
                            <Route path="newest" element={<Newest />} />
                        </Route>

                        <Route path="/products" element={<Products />}>
                            <Route index element={<ProductList />} />
                            <Route path="all" element={<ProductList />} />
                            <Route path="diecast-cars" element={<DiecastCars />} />
                            <Route path="action-figures" element={<ActionFigures />} />
                            <Route path="comics" element={<Comics />} />
                            <Route path="TradingCards" element={<TradingCards />} />
                        </Route>

                        <Route path="/productdetails/:id" element={<ProductDetails />} />

                        <Route
                            path="/wishlist"
                            element={
                                <ProtectedRoute>
                                    <Wishlist />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/buy-now"
                            element={
                                <ProtectedRoute>
                                    <BuyNow />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order-details"
                            element={
                                <ProtectedRoute>
                                    <OrderDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <CheckOut />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orderstatus/:orderId"
                            element={
                                <ProtectedRoute>
                                    <OrderStatus />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/vieworder"
                            element={
                                <ProtectedRoute>
                                    <ViewOrders />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/*" element={<ErrorResponse />} />
                    </Routes>
                </Suspense>
            </main>
            {!hideFooter && <Footer />}
        </>
    );
};

export default RoutesWrapper;
