import { BrowserRouter as Router, Routes, Route, Navigate , useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import TopBar from "./scenes/global/TopBar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import LoginForm from "./components/Login";
import SignUp from "./components/signup";
import ProductTable from "./components/pages/Products";
import Navbar from "./components/navbar";
import NotFoundPage from "./components/NotFoundPage";
import About from "./components/pages/About";
import Artisans from "./components/pages/Artisans";
import Collections from "./components/pages/Collections";
import Discover from "./components/pages/Discover";
import Home from "./components/pages/Home";
import Cart from "./components/pages/Cart";
import Products from './components/pages/Product';
import { UserAuthProvider, useUserAuth } from "./UserAuthContext";
import ProductDetail from "./components/pages/ProductDetail";
import Favorites from "./components/pages/Favorites";
import ArtisanProfile from "./components/pages/ArtisanProfile";
import  UserDash from "./components/artisanDash/ArtisanProducts";
import ArtisanSidebar from "./scenes/global/ArtisanSidebar";
import ArtisanDash from "./components/artisanDash/ArtisanDash";
import Reviews from "./components/artisanDash/Reviews";
import Orders from "./components/artisanDash/Orders";
import Profile from "./components/artisanDash/Profile";
import "./App.css";
import OrderConfirmation from "./components/pages/OrderConfirmation";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import { Chatbot } from "./components/Chatbot";
import Footer from "./components/Footer";
import CustomerDashboard from "./components/pages/CustomerDashboard";
import CustomerDashboardLayout from "./scenes/global/CustomerDashboardLayout";
import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Heart, Star } from "lucide-react";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import UserDashboardLayout from "./components/UserDashboardLayout";
import CustomerOrders from "./components/pages/CustomerOrders";
import AddProduct from "./components/artisanDash/AddProduct";
import EditProduct from "./components/artisanDash/EditProduct";
import CustomerOrderDetail from "./components/pages/CustomerOrderDetail";
import Messages from './components/pages/Messages';

/** Private Route Check */
function PrivateRoute({ children }) {
  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  return user && user.role === "admin" ? children : <Navigate to="/login" />;
}

/** Layout for Dashboard with Sidebar */
function DashboardLayout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <TopBar />
        {children}
      </main>
    </div>
  );
}

function ArtisanDashboardLayout({ children }) {
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem('user'));

  // If there's no logged in user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const getPageTitle = (pathname) => {
    return pathname.substring(1).charAt(0).toUpperCase() + pathname.slice(2) || 'Dashboard';
  };

  // const isSidebarOpen = location.pathname === '/dashboard';
  return (
      <div className="min-h-screen bg-[#FAFAFA]">
      <ArtisanSidebar />
      <div className={`lg:ml-64 transition-margin duration-300 ease-in-out `}>
        <header className="bg-white border-b border-gray-100">
          <div className="px-8 py-6">
            {/* <h2 className="text-2xl font-semibold text-gray-800">
              {getPageTitle(location.pathname)}
            </h2> */}
          </div>
        </header>
        <main className="w-full max-w-7xl mx-auto px-8 py-6">
          
        {children}

        </main>
      </div>
      </div>
  );
}

/** Layout for Public Pages (Navbar Only) */
function NavbarLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow content container mx-auto py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}


/** Main App Content */
function AppContent() {
  const { user: authUser } = useUserAuth();

  useEffect(() => {
    const fetchStats = async () => {
      // ... fetching logic ...
    };
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/forgot-password" element={< ForgotPassword/>} />
      <Route path="/reset-password" element={< ResetPassword/>} />

      
      <Route path="/" element={<NavbarLayout><Home /></NavbarLayout>} />
      <Route path="/home" element={<NavbarLayout><Home /></NavbarLayout>} />
      <Route path="/about" element={<NavbarLayout><About /></NavbarLayout>} />
      <Route path="/shop" element={<NavbarLayout><Products /></NavbarLayout>} />
      <Route path="/collections" element={<NavbarLayout><Collections /></NavbarLayout>} />
      <Route path="/discover" element={<NavbarLayout><Discover /></NavbarLayout>} />
      <Route path="/artisans" element={<NavbarLayout><Artisans /></NavbarLayout>} />
      <Route path="/cart" element={<NavbarLayout><Cart /></NavbarLayout>} />
      <Route path="/order-confirmation" element={<NavbarLayout><OrderConfirmation /></NavbarLayout>} />
      <Route path="/favorites" element={<UserDashboardLayout><Favorites /></UserDashboardLayout>} />
      <Route 
        path="/orders" 
        element={<UserDashboardLayout>{
          authUser?.role === 'artisan' ? <Orders /> : <CustomerOrders />
        }</UserDashboardLayout>}
      />
      <Route path="/messages" element={<UserDashboardLayout><Messages /></UserDashboardLayout>} />
      <Route path="/orders/:orderId" element={<UserDashboardLayout><CustomerOrderDetail /></UserDashboardLayout>} />
      <Route path="/reviews" element={<ArtisanDashboardLayout><Reviews /></ArtisanDashboardLayout>} />
      <Route path="/artisan-dashboard" element={<ArtisanDashboardLayout><ArtisanDash /></ArtisanDashboardLayout>} />
      <Route path="/profile" element={<UserDashboardLayout><Profile /></UserDashboardLayout>} />
      <Route path="/artisans/:id" element={<NavbarLayout><ArtisanProfile /></NavbarLayout>} />
      <Route path="/products/:id" element={<NavbarLayout><ProductDetail /></NavbarLayout>} />
      <Route path="/my-products" element={<ArtisanDashboardLayout><UserDash /></ArtisanDashboardLayout>} />
      <Route path="/customer-dash" element={<CustomerDashboardLayout><CustomerDashboard /></CustomerDashboardLayout>} />
      <Route path="/artisan/add-product" element={<ArtisanDashboardLayout><AddProduct /></ArtisanDashboardLayout>} />
      <Route path="/artisan/products/edit/:id" element={<ArtisanDashboardLayout><EditProduct /></ArtisanDashboardLayout>} />
      {/* Private Routes (Dashboard) */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><DashboardLayout><ProductTable /></DashboardLayout></PrivateRoute>} />

      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
      
    </Routes>
  );
}

/** Main App */
function App() {
  const [theme, colorMode] = useMode();

  return (
    <UserAuthProvider >
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
          <Toaster />
          <Chatbot />
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
    </UserAuthProvider>
    
  );
}

export default App;
