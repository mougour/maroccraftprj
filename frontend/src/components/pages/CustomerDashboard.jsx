import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Star,
  Package,
  Heart, // Assuming favorites icon is needed
  Clock,
  Search, 
  User, // Assuming user profile icon is needed
  ChevronRight, // Added for review section link
  MessageSquare, // Added for review icon
  DollarSign, // Added for total spent icon
} from 'lucide-react';
import axios from 'axios';
import { useUserAuth } from '../../UserAuthContext'; // Adjust path as necessary
import { format } from 'date-fns'; // Added for date formatting

const CustomerDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Keep if adding filter functionality
  // Customer-specific state (e.g., recent orders, recent activity)
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]); // Added state for recent reviews
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true); // Added loading state for reviews

  // State for Statistics
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true); // Added loading state for stats

  const { user } = useUserAuth();
  const navigate = useNavigate();
  // Removed token as it's not used for fetching public data like recent orders here

  useEffect(() => {
    document.title = 'Customer Dashboard';
  }, []);

  // Fetch recent orders for the customer
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoadingOrders(true);
        // Assuming an API endpoint for fetching customer orders
        const response = await axios.get(
          `http://localhost:5000/api/orders/user/${user._id}?limit=3` // Fetching last 3 orders
        );
        if (response.data.success) {
          setRecentOrders(response.data.orders);
        } else {
          setRecentOrders([]);
        }
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user?._id) fetchRecentOrders();
  }, [user?._id]);

  // Fetch recent reviews by the customer
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoadingReviews(true);
        // Assuming an API endpoint for fetching customer reviews
        const response = await axios.get(
          `http://localhost:5000/api/reviews/user/${user._id}?limit=3` // Fetching last 3 reviews
        );
        if (response.data.success) {
          setRecentReviews(response.data.reviews);
        } else {
          setRecentReviews([]);
        }
      } catch (err) {
        console.error('Error fetching recent reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (user?._id) fetchRecentReviews();
  }, [user?._id]);

  // Fetch customer statistics
   useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        // Assuming API endpoints for customer statistics
        const [ordersStatsResponse, favoritesCountResponse, reviewsCountResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/orders/user/${user._id}/stats`),
          axios.get(`http://localhost:5000/api/favorites/user/${user._id}/count`),
          axios.get(`http://localhost:5000/api/reviews/user/${user._id}/count`)
        ]);

        if (ordersStatsResponse.data.success) {
          setTotalOrders(ordersStatsResponse.data.totalOrders);
          setTotalSpent(ordersStatsResponse.data.totalSpent);
        }

        if (favoritesCountResponse.data.success) {
          setTotalFavorites(favoritesCountResponse.data.count);
        }

         if (reviewsCountResponse.data.success) {
          setTotalReviews(reviewsCountResponse.data.count);
        }

      } catch (err) {
        console.error('Error fetching customer stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?._id) fetchStats();
  }, [user?._id]);


  // Adapting Quick Actions for Customer (keeping definition but removing JSX render)
  const quickActions = [
    { label: 'View Orders', icon: Package, color: 'bg-blue-500', to: '/orders' },
    { label: 'View Favorites', icon: Heart, color: 'bg-red-500', to: '/favorites' },
    { label: 'Manage Profile', icon: User, color: 'bg-green-500', to: '/profile' },
  ];

  // Build Recent Activity from recent orders
  const activities = recentOrders.map(order => ({
    id: order._id,
    title: `Order #${order._id.substring(0, 8)}...`, // Shorten ID for display
    subtitle: `Total: $${order.totalAmount} - Status: ${order.status || 'Pending'}`,
    time: order.orderDate ? format(new Date(order.orderDate), 'PPP') : 'N/A', // Format date
    icon: ShoppingBag,
    color: 'bg-amber-500',
    status: order.status || 'Pending',
  }));

   // Build Recent Review items
  const reviewItems = recentReviews.map(review => ({
    id: review._id,
    productName: review.product?.name || 'Product', // Assuming review links to product
    rating: review.rating,
    comment: review.comment,
    time: review.createdAt ? format(new Date(review.createdAt), 'PPP') : 'N/A', // Assuming createdAt exists
    to: `/products/${review.product?._id}`, // Link to product page
  }));

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8"> {/* Lighter background, consistent padding */}
      <div className="max-w-7xl mx-auto">

        {/* Header with Welcome message */}
        <div className="mb-10 text-center"> {/* Increased bottom margin */}
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 drop-shadow-sm"> {/* Increased bottom margin */}
            Welcome Back, <span className="text-amber-600">{user?.name || 'Customer'}</span>! {/* Highlight name */}
          </h1>
          <p className="mt-2 text-lg text-gray-600">Here's a quick overview of your recent activity and key links.</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Statistics Section - Span 1 column on md+ */}
          <div className="md:col-span-1 mb-10 md:mb-0">
            {/* Title */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Activity at a Glance</h2>

            {/* Loading State */}
            {loadingStats ? (
              <div className="p-6 text-center text-gray-600">Loading statistics...</div>
            ) : (
              /* 2-column grid structure */
              <div className="grid grid-cols-2 gap-6"> {/* Explicitly setting 2 columns with gap for all screen sizes */}
                {/* Total Orders Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                  <div className="text-blue-500 bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                  <div className="text-green-500 bg-green-100 p-3 rounded-full flex-shrink-0">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Spent</p>
                    <p className="text-xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>

                {/* Total Favorites Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                  <div className="text-red-500 bg-red-100 p-3 rounded-full flex-shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Favorites</p>
                    <p className="text-xl font-bold text-gray-900">{totalFavorites}</p>
                  </div>
                </div>

                {/* Total Reviews Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                  <div className="text-purple-500 bg-purple-100 p-3 rounded-full flex-shrink-0">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Reviews Left</p>
                    <p className="text-xl font-bold text-gray-900">{totalReviews}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Sections - Span 2 columns on md+ */}
          <div className="md:col-span-2 space-y-10"> {/* Added space-y for vertical gap between sections */}
             {/* Recent Activity (Orders) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden"> {/* Added bottom margin */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Recent Orders</h2>
                <Link to="/orders" className="text-amber-600 hover:text-amber-800 text-base font-medium transition-colors duration-200 flex items-center"> {/* Changed link color */}
                  View All Orders <ChevronRight size={16} className="ml-1"/>
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {loadingOrders ? (
                  <div className="p-6 text-center text-gray-600">Loading recent orders...</div>
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 cursor-pointer flex items-center space-x-4"
                      onClick={() => navigate(`/orders/${activity.id}`)} // Assuming individual order page route
                    >
                      <div className={`${activity.color} p-3 rounded-full flex-shrink-0`}>
                          <activity.icon className="h-6 w-6 text-white" />
                        </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.subtitle}</p>
                        <p className="mt-1 text-xs text-gray-500 flex items-center"><Clock size={12} className="inline-block mr-1"/>{activity.time}</p>
                      </div>
                      <div className="flex-shrink-0">
                         <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {activity.status}
                          </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-600">No recent orders found.</div>
                )}
              </div>
            </div>

            {/* Recent Reviews Left by Customer - New Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Recent Reviews Given</h2>
                 {/* Link to view all reviews - update '/profile' to '/my-reviews' if that route is created */}
                <Link to="/profile" className="text-amber-600 hover:text-amber-800 text-base font-medium transition-colors duration-200 flex items-center">
                  View All Reviews <ChevronRight size={16} className="ml-1"/>
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                 {loadingReviews ? (
                   <div className="p-6 text-center text-gray-600">Loading recent reviews...</div>
                 ) : reviewItems.length > 0 ? (
                   reviewItems.map((review) => (
                     <div
                        key={review.id}
                        className="p-6 hover:bg-gray-50 transition duration-200 cursor-pointer flex items-start space-x-4"
                        onClick={() => navigate(review.to)} // Navigate to product page
                     >
                        <div className="bg-purple-100 p-3 rounded-full flex-shrink-0"> {/* Purple background for reviews */}
                          <MessageSquare size={20} className="text-purple-800" />
                        </div>
                        <div className="flex-1">
                           <h3 className="text-lg font-medium text-gray-900">{review.productName}</h3>
                           <div className="flex items-center text-sm text-gray-600 mb-2">
                             {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} ({review.rating}/5) {/* Display stars */}
                           </div>
                           <p className="text-gray-700 italic mb-2">"{review.comment}"</p> {/* Display comment */}
                           <p className="mt-1 text-xs text-gray-500 flex items-center"><Clock size={12} className="inline-block mr-1"/>{review.time}</p>
                        </div>
                     </div>
                   ))
                 ) : (
                  <div className="p-6 text-center text-gray-600">No recent reviews left.</div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;