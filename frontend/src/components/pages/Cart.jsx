import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  Box,
  Button,
  IconButton,
  Divider,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Truck,
  MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const Cart = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Cart - MAROCRAFT';
  }, []);

  const navigate = useNavigate();

  // Steps for the checkout
  const steps = ['Cart', 'Shipping', 'Payment'];

  // State for cart items and cart ID
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Shipping form state
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Remove card state variables – now using PayPal

  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Fetch the cart from the API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) return;

        const response = await axios.get(
          `http://localhost:5000/api/cart/user/${user._id}`
        );
        const cartData = response.data; // array of carts
        if (cartData && cartData.length > 0) {
          const cart = cartData[0];
          setCartId(cart._id);
          // cart.products is an array of objects: { productId: { ... }, quantity }
          setItems(cart.products);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, []);

  // ---------------------------------------------
  // Update Quantity (local state + backend PATCH)
  // ---------------------------------------------
  const updateQuantity = async (productId, change) => {
    const itemIndex = items.findIndex((item) => item.productId._id === productId);
    if (itemIndex === -1) return;

    const oldQuantity = items[itemIndex].quantity;
    const newQuantity = Math.max(1, oldQuantity + change);

    // Optimistically update local state
    setItems((prevItems) =>
      prevItems.map((item, idx) =>
        idx === itemIndex ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await axios.patch(
        `http://localhost:5000/api/cart/${cartId}/product/${productId}`,
        { quantity: newQuantity }
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity. Please try again.');
      // Revert local state on error
      setItems((prevItems) =>
        prevItems.map((item, idx) =>
          idx === itemIndex ? { ...item, quantity: oldQuantity } : item
        )
      );
    }
  };

  // Remove item from the cart
  const removeItem = async (productId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/cart/${cartId}/product/${productId}`
      );
      
      if (response.data.message) {
        setItems((prevItems) =>
          prevItems.filter((item) => item.productId._id !== productId)
        );
        toast.success('Item removed from cart successfully!');
        // Dispatch event for cart update
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        toast.error('Failed to remove item. Please try again.');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error(error.response?.data?.error || 'Failed to remove item. Please try again.');
    }
  };

  // Calculate subtotal from the items array
  const subtotal = items.reduce((sum, item) => {
    // Ensure we have valid product data
    if (!item || !item.productId) {
      console.warn('Invalid cart item:', item);
      return sum;
    }
    
    const price = parseFloat(item.productId.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const itemTotal = price * quantity;
    
    if (isNaN(itemTotal)) {
      console.warn('Invalid item total:', { price, quantity, item });
      return sum;
    }
    
    return sum + itemTotal;
  }, 0);

  // Shipping is free if subtotal >= 100, otherwise $10
  const shipping = subtotal >= 100 ? 0 : 10;

  // Apply a 10% discount if promo code is FIRST10
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // Handle promo code
  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'first10') {
      setPromoApplied(true);
      toast.success('Promo code applied successfully!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  // Next/Back Step Handlers
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Place Order – called after successful PayPal payment
  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        toast.error('You must be logged in to place an order.');
        return;
      }

      // Validate total amount
      if (isNaN(total) || total <= 0) {
        console.error('Invalid total:', { subtotal, shipping, discount, total });
        toast.error('Invalid order total. Please try again.');
        return;
      }

      const { fullName, address, city, state, postalCode, country } = shippingData;
      if (!fullName || !address || !city || !state || !postalCode || !country) {
        toast.error('Please fill out all shipping information.');
        return;
      }

      const shippingAddress = `${fullName}, ${address}, ${city}, ${state}, ${postalCode}, ${country}`;
      
      // Validate and format order products
      const orderProducts = items.map(item => {
        if (!item || !item.productId) {
          throw new Error('Invalid cart item');
        }
        
        const price = parseFloat(item.productId.price);
        const quantity = parseInt(item.quantity);
        
        if (isNaN(price) || isNaN(quantity)) {
          throw new Error('Invalid price or quantity');
        }
        
        return {
          productId: item.productId._id,
          quantity: quantity,
          price: price
        };
      });

      const payload = {
        customerId: user._id,
        products: orderProducts,
        totalAmount: parseFloat(total.toFixed(2)),
        shippingAddress,
      };

      // Place the order
      const orderResponse = await axios.post(
        'http://localhost:5000/api/orders',
        payload,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error('Order placement failed');
      }

      // Clear the cart
      try {
        await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
        // Clear local state
        setItems([]);
        setCartId('');
        // Clear any stored cart data
        sessionStorage.removeItem('cart');
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
      }
      
      // Show success message and dialog
      toast.success('Your order has been placed successfully! Thank you for your purchase.');
      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.success('Your order has been placed successfully! Thank you for your purchase.');
      setShowSuccessDialog(true);
    }
  };

  const handleCloseSuccessDialog = async () => {
    try {
      // Clear the cart in the backend
      if (cartId) {
        await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
      }
      
      // Clear local state
      setItems([]);
      setCartId('');
      setShowSuccessDialog(false);
      
      // Clear any stored cart data
      sessionStorage.removeItem('cart');
      
      // Refresh the page to ensure cart is cleared
      window.location.href = '/shop';
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Still navigate to shop even if there's an error
      window.location.href = '/shop';
    }
  };

  // Add a function to check if cart is empty
  const isCartEmpty = () => {
    return items.length === 0;
  };

  // -------------------------
  // Render individual Cart Item
  // -------------------------
  const CartItem = ({ item }) => {
    const product = item.productId;
    if (!product) return null;
    return (
      <Card
        sx={{
          mb: 2,
          overflow: 'visible',
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: 1,
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': {
            boxShadow: 4,
            borderColor: '#ff9800',
          },
          background: '#fcfcfc',
        }}
        variant="outlined"
      >
        <Grid container spacing={2}>
          {/* Product Image */}
          <Grid item xs={12} sm={4}>
            <CardMedia
              component="img"
              image={product.images?.[0] || '/default.png'}
              alt={product.name}
              sx={{
                borderRadius: 2,
                height: 180,
                objectFit: 'cover',
              }}
            />
          </Grid>
          {/* Product Info */}
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography
                variant="h6"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                {product.name}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  mt: 1,
                  cursor: 'pointer',
                  '&:hover .artisan-name': { color: 'primary.main' },
                }}
                onClick={() => navigate(`/artisans/${product.user?._id || ''}`)}
              >
                <Avatar
                  src={product.user?.profilePicture || '/default.png'}
                  alt={product.user?.name || 'Artisan'}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    className="artisan-name"
                    sx={{ transition: 'color 0.2s ease-in-out' }}
                  >
                    {product.user?.name || 'Unknown Artisan'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={14} color="#666" />
                    <Typography variant="caption" color="text.secondary">
                      {product.user?.address || 'No address'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Rating value={product.rating || 3} size="small" readOnly />
                  <Typography variant="caption" color="text.secondary">
                    {product.numReviews || 0} reviews
                  </Typography>
                </Box>
              </Box>
              {product.category && (
                <Box sx={{ mb: 1 }}>
                  <Chip label={product.category} size="small" />
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {product.description?.slice(0, 80)}...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(product._id, -1)}
                      disabled={item.quantity <= 1}
                      sx={{ borderRadius: 0 }}
                    >
                      <Minus size={16} />
                    </IconButton>
                    <Typography sx={{ px: 2, py: 1 }}>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(product._id, 1)}
                      disabled={item.quantity >= (product.countInStock || Infinity)}
                      sx={{ borderRadius: 0 }}
                    >
                      <Plus size={16} />
                    </IconButton>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => removeItem(product._id)}
                    sx={{ ml: 'auto' }}
                  >
                    <Trash2 size={20} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    );
  };

  // -------------------------
  // Render the Cart Step
  // -------------------------
  const renderCartStep = () => {
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button component={Link} to="/shop" startIcon={<ArrowLeft />} sx={{ mr: 2 }}>
            Continue Shopping
          </Button>
          <Typography variant="h5">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </Typography>
        </Box>
        {!isCartEmpty() ? (
          items.map((item) => <CartItem key={item._id} item={item} />)
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" paragraph>
              Add some items to your cart to continue shopping
            </Typography>
            <Button component={Link} to="/shop" variant="contained" color="primary">
              Browse Products
            </Button>
          </Paper>
        )}
      </>
    );
  };

  // -------------------------
  // Render the Shipping Step
  // -------------------------
  const renderShippingStep = () => {
    const handleChange = (e) => {
      const { name, value } = e.target;
      setShippingData((prev) => ({ ...prev, [name]: value }));
    };

    return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Shipping Information
        </Typography>
        <TextField
          label="Full Name"
          name="fullName"
          fullWidth
          sx={{ mb: 2 }}
          value={shippingData.fullName}
          onChange={handleChange}
        />
        <TextField
          label="Address"
          name="address"
          fullWidth
          sx={{ mb: 2 }}
          value={shippingData.address}
          onChange={handleChange}
        />
        <TextField
          label="City"
          name="city"
          fullWidth
          sx={{ mb: 2 }}
          value={shippingData.city}
          onChange={handleChange}
        />
        <TextField
          label="State/Province"
          name="state"
          fullWidth
          sx={{ mb: 2 }}
          value={shippingData.state}
          onChange={handleChange}
        />
        <TextField
          label="Postal Code"
          name="postalCode"
          fullWidth
          sx={{ mb: 2 }}
          value={shippingData.postalCode}
          onChange={handleChange}
        />
      <TextField
  name="country"
  label="Country"
  fullWidth
  value={shippingData.country}
  onChange={handleChange}
  placeholder="Select a country"
  sx={{ mb: 2 }}
  InputProps={{
    inputProps: { list: 'country-list' }
  }}
/>
<datalist id="country-list">
  <option value="USA" />
  <option value="Canada" />
  <option value="UK" />
  <option value="Australia" />
</datalist>

      </Box>
    );
  };

  // -------------------------
  // Render the Payment Step using PayPal
  // -------------------------
  const renderPaymentStep = () => {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Payment Information
        </Typography>
        <PayPalScriptProvider options={{ "client-id": "AT82GQ0vqHQ_rGJ_8VlGcFxANwft6xeesJ4rnYBAOligOpSyZKRpOfF3RpZhOEa6tV53mlR1_VZ_etEe", currency: "USD" }}>
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: total.toFixed(2),
                  },
                }],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                // Payment successful: place the order
                handlePlaceOrder();
              });
            }}
            onError={(err) => {
              console.error("PayPal Checkout onError", err);
              toast.error("Payment failed, please try again.");
            }}
          />
        </PayPalScriptProvider>
      </Box>
    );
  };

  // -------------------------
  // Render content based on active step
  // -------------------------
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCartStep();
      case 1:
        return renderShippingStep();
      case 2:
        return renderPaymentStep();
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const isLastStep = activeStep === 2;

  return (
    <Box sx={{ bgcolor: '#f7f8fa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg" sx={{ py: 4, mt: 8, boxShadow: 3, borderRadius: 4, bgcolor: '#fff' }}>
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowLeft />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={isLastStep ? handlePlaceOrder : handleNext}
                disabled={activeStep === 0 && items.length === 0}
                startIcon={isLastStep ? null : null}
              >
                {isLastStep ? 'Place Order' : 'Next'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 100, borderRadius: 3, boxShadow: 4, bgcolor: '#f9fafb', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Box sx={{ my: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Subtotal</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">Shipping</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </Typography>
                  </Grid>
                  {promoApplied && (
                    <>
                      <Grid item xs={6}>
                        <Typography color="success.main">Discount</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography color="success.main">
                          -${discount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handlePromoCode}
                    disabled={promoApplied}
                  >
                    Apply
                  </Button>
                  {promoApplied && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Promo code applied successfully!
                    </Alert>
                  )}
                </Box>
                <Divider sx={{ my: 3 }} />
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>
              {activeStep === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={items.length === 0}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
                  onClick={handleNext}
                >
                  Proceed to Checkout
                </Button>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Truck size={20} />
                <Typography variant="body2" color="text.secondary">
                  Free shipping on orders over $100
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
          Thank You for Your Purchase!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your order has been successfully placed
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We appreciate your business and hope you enjoy your products.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will receive an email confirmation shortly.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseSuccessDialog}
            size="large"
            sx={{ minWidth: 200 }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cart;
