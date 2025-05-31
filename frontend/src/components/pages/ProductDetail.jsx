import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  Rating,
  Chip,
  Divider,
  Paper,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  CircularProgress,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  Truck,
  Search,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // -------------------
  // State Variables
  // -------------------
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Favorites tracking
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  // New review states
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Control the review form pop-out (modal)
  const [showReviewModal, setShowReviewModal] = useState(false);

  // NEW: Review search query state
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');

  // NEW: State to track if the logged-in user has ordered this product
  const [hasOrderedProduct, setHasOrderedProduct] = useState(false);

  // Retrieve user & token from sessionStorage
  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem('token');

  // Check if the logged-in user is the artisan who owns this product
  const isProductOwner = loggedInUser && loggedInUser.role === 'artisan' && product?.user?._id === loggedInUser._id;

  // -------------------
  // Data Fetching
  // -------------------
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product.');
      }
      const data = await response.json();
      setProduct(data);

      // Check if product is in user's favorites
      if (loggedInUser && token) {
        const favResponse = await axios.get(
          `http://localhost:5000/api/favorites/${loggedInUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const favoritesData = favResponse.data;
        const foundFavorite = favoritesData.find(
          (fav) => fav.product._id === data._id
        );
        if (foundFavorite) {
          setIsFavorite(true);
          setFavoriteId(foundFavorite._id);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reviews/product/${id}`
      );
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // NEW: Function to check if the logged-in customer has ordered this product
  const checkIfCustomerOrderedProduct = async () => {
    if (!loggedInUser || loggedInUser.role !== 'customer' || !product) {
      setHasOrderedProduct(false);
      return;
    }
    try {
      // Assuming a backend endpoint to get customer orders by user ID
      const response = await axios.get(`http://localhost:5000/api/orders/user/${loggedInUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customerOrders = response.data.orders;
      
      // Check if any order contains the current product
      const ordered = customerOrders.some(order => 
        order.products.some(item => item.productId._id === product._id)
      );
      setHasOrderedProduct(ordered);

    } catch (error) {
      console.error('Error checking if customer ordered product:', error);
      setHasOrderedProduct(false);
    }
  };

  // -------------------
  // Favorites
  // -------------------
  const handleFavoriteToggle = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to favorite products.');
      return;
    }
    try {
      if (!isFavorite) {
        const response = await axios.post(
          'http://localhost:5000/api/favorites',
          { product: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Added to favorites');
        setIsFavorite(true);
        setFavoriteId(response.data._id);
        // Dispatch event for favorites update
        window.dispatchEvent(new Event('favoritesUpdated'));
      } else {
        await axios.delete(
          `http://localhost:5000/api/favorites/${favoriteId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Removed from favorites');
        setIsFavorite(false);
        setFavoriteId(null);
        // Dispatch event for favorites update
        window.dispatchEvent(new Event('favoritesUpdated'));
      }
    } catch (error) {
      console.error('Error toggling favorites:', error);
      toast.error('Error updating favorites. Please try again.');
    }
  };

  // -------------------
  // Cart
  // -------------------
  const handleAddToCart = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to add items to cart.');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        {
          product: product._id,
          quantity: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart');
      // Dispatch event for cart update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart. Please try again.');
    }
  };

  // -------------------
  // Quantity
  // -------------------
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(
      1,
      Math.min(product?.maxQuantity || Infinity, quantity + change)
    );
    setQuantity(newQuantity);
  };

  // -------------------
  // Tabs
  // -------------------
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // -------------------
  // Submit Review (Modal)
  // -------------------
  const handleSubmitReview = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to add a review.');
      return;
    }
    if (!newReviewRating || !newReviewComment.trim()) {
      toast.error('Please provide a rating and comment.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/api/reviews',
        {
          productId: id,
          customerId: loggedInUser._id,
          rating: newReviewRating,
          comment: newReviewComment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review added successfully!');
      setNewReviewRating(0);
      setNewReviewComment('');
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to add review. Please try again.');
    }
  };

  // -------------------
  // Lifecycle
  // -------------------
  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    // Check if customer has ordered the product after product and user info are available
    checkIfCustomerOrderedProduct();
  }, [id, loggedInUser, product]); // Depend on id, loggedInUser, and product

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We couldn't find the product you're looking for. Please try again later.
        </Typography>
      </Container>
    );
  }

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // NEW: Filter reviews based on search query
  const filteredReviews = reviews.filter((review) => {
    const searchLower = reviewSearchQuery.toLowerCase();
    return (
      review.comment.toLowerCase().includes(searchLower) ||
      (review.customerId?.name &&
        review.customerId.name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ position: 'relative' }}>
            {product.images && product.images.length > 0 && (
              <Box
                component="img"
                src={product.images[selectedImage]}
                alt={product.name}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  mb: 2,
                  objectFit: 'cover',
                  aspectRatio: '1/1',
                }}
              />
            )}
            <ImageList cols={4} gap={8}>
              {product.images?.map((image, index) => (
                <ImageListItem
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    cursor: 'pointer',
                    border:
                      index === selectedImage ? '2px solid #FFD700' : 'none',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading="lazy"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6} sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            {product.name}
          </Typography>
          {/* Edit Product Button (visible only to the artisan owner) */}
          {isProductOwner && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              sx={{ mt: 1, mb: 2 }} // Add some top margin
              onClick={() => navigate(`/artisan/products/edit/${product._id}`)} // Navigate to edit page
            >
              Edit Product
            </Button>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            By <span style={{ fontWeight: 'bold' }}>{product?.user?.name || 'Unknown Artisan'}</span>
          </Typography>

          {product?.category && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category: {product.category.name}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={averageRating} precision={0.5} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({reviews.length} reviews)
            </Typography>
          </Box>

          <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
            ${product.price}
          </Typography>

          <Box sx={{ my: 2 }}>
            {product.tags?.map((tag) => (
              <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1, bgcolor: '#e0e0e0' }} />
            ))}
          </Box>

          {/* Quantity & Add to Cart */}
          <Box sx={{ my: 3, p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Quantity
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
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
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Minus size={16} />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: '30px', textAlign: 'center' }}>{quantity}</Typography>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.maxQuantity || Infinity)}
                  size="small"
                >
                  <Plus size={16} />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {typeof product.countInStock === 'number' ? product.countInStock : 0} items available
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flex: 1, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
              >
                Add to Cart
              </Button>

              <Tooltip
                title={
                  isFavorite
                    ? 'Remove from Favorites'
                    : 'Add to Favorites'
                }
              >
                <IconButton
                  onClick={handleFavoriteToggle}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Heart
                    size={20}
                    fill={isFavorite ? '#ff4081' : 'none'}
                    color={isFavorite ? '#ff4081' : '#666'}
                  />
                </IconButton>
              </Tooltip>

              <Tooltip title="Share Product">
                <IconButton
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Product link copied to clipboard!');
                  }}
                >
                  <Share2 size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e8f5e9',
              p: 2,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Truck size={20} color="#4caf50" />
            <Typography variant="body2" color="#388e3c">
              Free shipping on orders over $100
            </Typography>
          </Box>
        </Grid>

        {/* Product Details Tabs */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              variant="fullWidth"
            >
              <Tab label="Specifications" />
              <Tab label="Reviews" />
              <Tab label="Shipping" />
            </Tabs>
            <Box>
              {/* Specifications Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {product.description}
                  </Typography>
                  {/* Add other specifications here if available */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {product.specifications &&
                      Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <Grid item xs={12} sm={6} key={key}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: '#fafafa',
                                borderRadius: 1,
                              }}
                            >
                              <Typography color="text.secondary" fontWeight="medium">
                                {key}
                              </Typography>
                              <Typography>{value}</Typography>
                            </Box>
                          </Grid>
                        )
                      )}
                  </Grid>
                </Box>
              )}

              {/* Reviews Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2 }} fontWeight="bold">
                    Reviews
                  </Typography>
                  {/* NEW: Search field for reviews */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search reviews..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ mb: 3 }}>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((review) => (
                        <Paper
                          key={review._id}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 2,
                            boxShadow: 1,
                            bgcolor: '#fff',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              mb: 1.5,
                            }}
                          >
                            <Avatar
                              src={
                                review.customerId?.profilePicture ||
                                '/default-avatar.png'
                              }
                              alt={review.customerId?.name || 'Anonymous'}
                              sx={{ mr: 2, width: 40, height: 40 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {review.customerId?.name || 'Anonymous'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Rating
                              value={review.rating}
                              readOnly
                              size="small"
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: 'italic' }}
                          >
                            {review.comment}
                          </Typography>
                        </Paper>
                      ))
                    ) : (filteredReviews.length === 0 && reviewSearchQuery) ? (
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No reviews found for "{reviewSearchQuery}".
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        No reviews yet. Be the first to leave a review!
                      </Typography>
                    )}
                  </Box>

                  {loggedInUser ? (
                    // Only allow writing a review if logged in, is a customer, and has ordered the product
                    loggedInUser.role === 'customer' ? (
                      hasOrderedProduct ? (
                        <Button
                          variant="contained"
                          onClick={() => setShowReviewModal(true)}
                          color="primary"
                        >
                          Write a Review
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          You must order this product to write a review.
                        </Typography>
                      )
                    ) : (
                      // Message for logged-in non-customers (e.g., artisans)
                       <Typography variant="body2" color="text.secondary" textAlign="center">
                        Only customers can write reviews.
                      </Typography>
                    )
                  ) : (
                    // Message for users who are not logged in
                    <Typography variant="body2" color="error" textAlign="center">
                      Please log in to write a review.
                    </Typography>
                  )}
                </Box>
              )}

              {/* Shipping Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.dark">
                    Shipping Information
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    We offer several shipping options to meet your needs:
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    <strong>Standard Shipping:</strong> Estimated delivery within 5-7 business days. Cost calculated at checkout based on location.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    <strong>Express Shipping:</strong> Estimated delivery within 2-3 business days. Higher cost, also calculated at checkout.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    Shipping costs are calculated based on the weight and dimensions of the order, as well as the destination.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 0 }}>
                    You will receive a tracking number via email once your order has shipped.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Review Form Modal */}
      <Dialog
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: '#fff', pb: 2 }}>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Your Rating
            </Typography>
            <Rating
              name="new-review-rating"
              value={newReviewRating}
              onChange={(e, newValue) => setNewReviewRating(newValue)}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your review"
            value={newReviewComment}
            onChange={(e) => setNewReviewComment(e.target.value)}
            sx={{ mt: 3 }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setShowReviewModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitReview} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail;
