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
import OrderDetails from "./pages/landing/OrderDetails";
import ProductList from "./pages/products/ProductList";
import DiecastCars from "./pages/products/DiecastCars";
import Comics from "./pages/products/Comics";
import ActionFigures from "./pages/products/ActionFigures";
import TradingCards from "./pages/products/TradingCards";
import CheckOut from "./pages/landing/CheckOut";
import OrderStatus from "./pages/landing/OrderStatus";
import ViewOrders from "./common/components/ViewOrders";

// ✅ Lazy loaded components
const Products = lazy(() => import("./pages/products/Products"));

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoutesWrapper = () => {
    const location = useLocation();
    const hideNavbar = ["/login", "/register"].includes(location.pathname);
    const hideFooter = ["/login", "/register", "/cart", "/wishlist"].includes(location.pathname);

    return (
        <>
            {!hideNavbar && <NavBar2 />}
            <main>
                {/* ✅ Wrap entire Routes in <Suspense /> */}
                <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Landing />}>
                            <Route index element={<TopRated />} />
                            <Route path="top-rated" element={<TopRated />} />
                            <Route path="newest" element={<Newest />} />
                        </Route>

                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />

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
                                    <ViewOrders/>
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
