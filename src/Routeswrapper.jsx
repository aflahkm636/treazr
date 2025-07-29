import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Import critical components normally (used in initial render)
import NavBar2 from "./common/layout/Navbar2";
import Footer from "./common/layout/Footer";
import ScrollToTop from "./common/components/ScrollTop";
import { useAuth } from "./common/context/AuthProvider";
import { ThemeProvider } from "./common/context/Darkthemeprovider";
import Loading from "./common/components/Loading";

// Lazy load components that aren't needed immediately
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Landing = lazy(() => import("./pages/landing/Landing"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ErrorResponse = lazy(() => import("./pages/Errorresponse"));
const TopRated = lazy(() => import("./pages/landing/Toprated"));
const Newest = lazy(() => import("./pages/landing/Newest"));
const ProductDetails = lazy(() => import("./common/components/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderDetails = lazy(() => import("./pages/Order/OrderDetails"));
const ProductList = lazy(() => import("./pages/products/ProductList"));
const DiecastCars = lazy(() => import("./pages/products/DiecastCars"));
const Comics = lazy(() => import("./pages/products/Comics"));
const ActionFigures = lazy(() => import("./pages/products/ActionFigures"));
const TradingCards = lazy(() => import("./pages/products/TradingCards"));
const CheckOut = lazy(() => import("./pages/Order/CheckOut"));
const OrderStatus = lazy(() => import("./pages/Order/OrderStatus"));
const ViewOrders = lazy(() => import("./common/components/ViewOrders"));
const Profile = lazy(() => import("./common/components/Profile"));
const BuyNow = lazy(() => import("./common/components/BuyNow"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const OrderManage = lazy(() => import("./admin/OrderManage"));
const ProductManage = lazy(() => import("./admin/ProductManage"));
const ManageUser = lazy(() => import("./admin/ManageUser"));
const AdminDashboard = lazy(() => import("./admin/Admindashboard"));
const UserDetails = lazy(() => import("./admin/UserDetails"));
const Products = lazy(() => import("./pages/products/Products"));

/**
 * ProtectedRoute - Redirects to login if user is not authenticated
 * @param {Object} props
 * @param {ReactNode} props.children - Content to protect
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute - Redirects to home if user is already authenticated
 * @param {Object} props
 * @param {ReactNode} props.children - Content to show only to unauthenticated users
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

/**
 * Main router component with lazy loading implementation
 */
const RoutesWrapper = () => {
    const location = useLocation();
    
    // Determine when to hide navbar and footer
    const hideNavbar = ["/login", "/register"].includes(location.pathname) || 
                      location.pathname.startsWith("/admin");
    const hideFooter = ["/login", "/register", "/cart", "/wishlist", "/profile", "/checkout"]
                      .includes(location.pathname) || 
                      location.pathname.startsWith("/admin");

    return (
        <>
            {/* Show navbar unless on login/register or admin pages */}
            {!hideNavbar && <NavBar2 />}
            
            <main>
                {/* Suspense boundary for all lazy-loaded components */}
                <Suspense fallback={<div className="text-center py-10">
                    <Loading/>
                </div>}>
                    <ScrollToTop />

                    <Routes>
                        {/* Admin routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<ManageUser />} />
                            <Route path="users-details/:userId" element={<UserDetails />} />
                            <Route path="products" element={<ProductManage />} />
                            <Route path="orders" element={<OrderManage />} />
                        </Route>

                        {/* Authentication routes */}
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }/>
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }/>

                        {/* Main landing page with nested routes */}
                        <Route path="/" element={<Landing />}>
                            <Route index element={<TopRated />} />
                            <Route path="top-rated" element={<TopRated />} />
                            <Route path="newest" element={<Newest />} />
                        </Route>

                        {/* Products section */}
                        <Route path="/products" element={<Products />}>
                            <Route index element={<ProductList />} />
                            <Route path="all" element={<ProductList />} />
                            <Route path="diecast-cars" element={<DiecastCars />} />
                            <Route path="action-figures" element={<ActionFigures />} />
                            <Route path="comics" element={<Comics />} />
                            <Route path="TradingCards" element={<TradingCards />} />
                        </Route>

                        {/* Product details */}
                        <Route path="/productdetails/:id" element={<ProductDetails />} />

                        {/* Protected user routes */}
                        <Route path="/wishlist" element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }/>
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }/>
                        <Route path="/buy-now" element={
                            <ProtectedRoute>
                                <BuyNow />
                            </ProtectedRoute>
                        }/>
                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }/>
                        <Route path="/order-details" element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }/>
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <CheckOut />
                            </ProtectedRoute>
                        }/>
                        <Route path="/orderstatus/:orderId" element={
                            <ProtectedRoute>
                                <OrderStatus />
                            </ProtectedRoute>
                        }/>
                        <Route path="/vieworder" element={
                            <ProtectedRoute>
                                <ViewOrders />
                            </ProtectedRoute>
                        }/>

                        {/* Catch-all route for 404 errors */}
                        <Route path="/*" element={<ErrorResponse />} />
                    </Routes>
                </Suspense>
            </main>

            {/* Show footer unless on specific pages */}
            {!hideFooter && <Footer />}
        </>
    );
};

export default RoutesWrapper;