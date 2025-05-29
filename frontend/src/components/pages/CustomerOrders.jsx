import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Grid, CircularProgress, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
// Import icons if needed for status or other indicators
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user && user._id) {
          // Fetch orders for the logged-in customer
          const response = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`);
          if (response.data.success) {
            setOrders(response.data.orders);
          } else {
            setOrders([]);
            setError(response.data.error || 'Failed to fetch orders.');
          }
        } else {
          // Handle case where user is not logged in or user._id is missing
          setOrders([]);
          setError('User not logged in or user ID missing.');
        }
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper to get status color (similar to artisan view for consistency)
  const getStatusColor = (status) => {
    const colors = {
      processing: "warning.main", // Using MUI color names
      shipped: "info.main",
      delivered: "success.main",
      cancelled: "error.main",
      pending: "text.secondary",
    };
    return colors[status] || "text.secondary";
  };

  // Helper to get status icon (optional, could be added if desired)
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


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box maxWidth="lg" sx={{ mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" color="text.primary">My Orders</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>View and track your placed orders</Typography>
        </Box>

        {/* Orders List */}
        <Box sx={{ spaceY: 4 }}> {/* Using spaceY for gap between orders */}
          {orders.length > 0 ? (
            orders.map((order) => (
              <Paper
                key={order._id}
                elevation={2} // Slightly increased elevation
                sx={{ borderRadius: 2, overflow: "hidden", "&:hover": { boxShadow: 4 }, transition: "box-shadow 0.2s ease", mb: 3 }} // Increased mb
              >
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, md: { alignItems: "center", justifyContent: "space-between" }, mb: 2, gap: { xs: 2, md: 0 } }}>
                    <Box>
                      <Typography variant="h6" fontWeight="semibold" color="text.primary">Order #{order.orderNumber}</Typography>
                       <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}> {/* Box for status with icon */}
                         {/* Optional: Add status icon */}
                         {/* {React.createElement(getStatusIcon(order.status), { sx: { fontSize: '1rem', mr: 0.5, color: getStatusColor(order.status) } })} */}
                         <Typography variant="body2" color={getStatusColor(order.status)} fontWeight="medium">
                            Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                         </Typography>
                       </Box>
                    </Box>
                    <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                      <Typography variant="h6" fontWeight="semibold" color="text.primary">
                        Total: ${Number(order.totalAmount || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}> {/* Added mt for spacing */}
                        Date: {new Date(order.orderDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" color="text.primary" mb={1}>Order Items</Typography>
                    <Box sx={{ spaceY: 1 }}> {/* Using spaceY for gap between items */}
                      {order.products.map((item) => (
                        // Assuming product name is directly on item.productId if populated
                        <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", bgcolor: 'action.hover', px: 1.5, py: 1, borderRadius: 1 }}> {/* Styled item row */}
                          <Typography component="span" color="text.primary">
                            {item.quantity}x {item.productId?.name || 'Unknown Product'} {/* Added optional chaining */}
                          </Typography>
                          <Typography component="span" fontWeight="medium" color="text.primary">
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
                        <Typography variant="subtitle1" fontWeight="medium" color="text.primary" mb={1}>Shipping Address</Typography>
                        <Typography variant="body2" color="text.secondary">{order.shippingAddress}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="medium" color="text.primary" mb={1}>Payment Status</Typography>
                        <Typography variant="body2" color="text.secondary">{order.paymentStatus}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Paper>
            ))
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="text.secondary">No orders found.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerOrders; 