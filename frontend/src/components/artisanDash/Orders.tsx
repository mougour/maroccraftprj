import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  Search,
  Filter,
  ChevronDown,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, Paper, Grid, Input, Divider } from '@mui/material';
import toast from 'react-hot-toast';

const Orders = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from the API using axios
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        // Assuming a backend endpoint to get orders for a specific artisan's products
        let url = `http://localhost:5000/api/orders/artisan/${user._id}`;

        if (user && user._id) {
        const response = await axios.get(url);
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }
        } else {
          // Handle case where user is not logged in or user._id is missing
          setOrders([]);
          console.error("User not logged in or user ID missing.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []); // Dependency on user._id might be needed if user state can change after initial load

  const getStatusColor = (status) => {
    const colors = {
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-110 text-blue-800", // Adjusted blue color for better contrast
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-gray-100 text-gray-800", // Added pending status color
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      processing: Clock,
      shipped: Package,
      delivered: CheckCircle,
      cancelled: AlertCircle,
      pending:Clock,
    };
    return icons[status] || Package;
  };

  const filters = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const url = `http://localhost:5000/api/orders/${orderId}/status`;
      const response = await axios.put(url, { status: newStatus });

      if (response.data.success) {
        toast.success('Order status updated successfully!');
        // Update the order in the local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        toast.error('Failed to update order status.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status.');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter !== 'all' && order.status !== selectedFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        order.products.some((item) =>
          item.productId.name.toLowerCase().includes(searchLower) && // Check product name
          item.productId.user === JSON.parse(sessionStorage.getItem('user') || '{}')._id // Ensure product belongs to artisan
        )
      );
    }
     // If no search query, filter by status, but still ensure products belong to the artisan
     if (selectedFilter !== 'all') {
        return order.products.some(item =>
          item.productId && item.productId.user === JSON.parse(sessionStorage.getItem('user') || '{}')._id &&
          order.status === selectedFilter
        );
     } else {
       // If no search or status filter, just ensure products belong to the artisan
        return order.products.some(item =>
          item.productId && item.productId.user === JSON.parse(sessionStorage.getItem('user') || '{}')._id
        );
     }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box maxWidth="lg" sx={{ mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Link to="/artisan-dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, sm: { alignItems: "center", justifyContent: "space-between" } }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="gray.900">Orders</Typography>
              <Typography variant="body1" color="gray.600" mt={1}>Manage and track your customer orders</Typography>
            </Box>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 4, display: "flex", flexDirection: { xs: "column", sm: "row" }, sm: { alignItems: "center", justifyContent: "space-between" }, gap: 2 }}>
          <Box sx={{ position: "relative", flex: 1, maxWidth: { sm: "sm", md: "md" } }}>
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: "100%", pl: 4, pr: 1, py: 1, borderRadius: 2, border: "1px solid #d1d5db", "& input:focus": { outline: "none", boxShadow: "0 0 0 2px #fcd34d", borderColor: "#fcd34d" } }}
            />
            <Search size={20} color="#9ca3af" style={{ position: "absolute", left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? "contained" : "outlined"}
                color={selectedFilter === filter.value ? "warning" : "grey"}
                onClick={() => setSelectedFilter(filter.value)}
                size="small"
                sx={{ borderRadius: 4, px: 2, py: 1, fontWeight: "medium" }}
              >
                {filter.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Orders List */}
        <Box sx={{ spaceY: 4 }}>
          {filteredOrders.map((order) => (
            <Paper
              key={order._id}
              elevation={1}
              sx={{ borderRadius: 2, overflow: "hidden", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s ease", mb: 2 }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, md: { alignItems: "center", justifyContent: "space-between" }, mb: 2, gap: { xs: 2, md: 0 } }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography variant="h6" fontWeight="semibold" color="gray.900">Order #{order.orderNumber}</Typography>
                      <Box
                        component="span"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 4,
                          fontSize: "0.75rem",
                          fontWeight: "medium",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          ...getStatusColor(order.status),
                        }}
                      >
                        {React.createElement(getStatusIcon(order.status), { className: "h-4 w-4" })}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Box>
                    </Box>
                    {order.customerName && (
                      <Typography variant="body2" color="gray.600">Customer: {order.customerName}</Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                    <Typography variant="h6" fontWeight="semibold" color="gray.900">
                      Total: ${Number(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="gray.500">
                      Date: {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" color="gray.900" mb={1}>Order Items</Typography>
                  <Box sx={{ spaceY: 1 }}>
                    {order.products.map((item) => (
                      <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                        <Typography component="span" color="gray.600">
                          {item.quantity}x {item.productId.name}
                        </Typography>
                        <Typography component="span" fontWeight="medium" color="gray.900">
                          ${Number(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Grid container spacing={2} sx={{ fontSize: "0.9rem" }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="medium" color="gray.900" mb={1}>Shipping Address</Typography>
                      <Typography variant="body2" color="gray.600">{order.shippingAddress}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="medium" color="gray.900" mb={1}>Payment Status</Typography>
                      <Typography variant="body2" color="gray.600">{order.paymentStatus}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Status Update Buttons */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  {order.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleUpdateStatus(order._id, 'shipped')}
                      disabled={loading}
                      sx={{ fontWeight: "medium" }}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleUpdateStatus(order._id, 'delivered')}
                      disabled={loading}
                      sx={{ fontWeight: "medium" }}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  {(order.status === 'pending' || order.status === 'shipped') && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                      disabled={loading}
                      sx={{ fontWeight: "medium" }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
        {filteredOrders.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="gray.600">No orders found.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Orders;
