import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Button,
  IconButton,
  Rating,
  Chip,
  Tabs,
  Tab,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useUserAuth } from '../../UserAuthContext';

const Favorites = () => {
  useEffect(() => {
    document.title = 'Favorites - MAROCRAFT';
  }, []);
  const [favoriteDocs, setFavoriteDocs] = useState([]); // an array of favorite documents
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user & token from sessionStorage
  const { user } = useUserAuth();
  const token = sessionStorage.getItem('token');

  // Fetch user's favorites from the server
  const fetchFavorites = async () => {
    if (!user || !token) {
      setLoading(false);
      setError('User not logged in.');
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/favorites/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // The response is presumably an array of favorites
      // e.g. [ { _id, user, product: {...} }, { ... }, ... ]
      const data = response.data;

      // Ensure it's an array and contains product data
      const favoritesArray = Array.isArray(data) ? data.filter(fav => fav.product) : []; // Filter out entries without product
      setFavoriteDocs(favoritesArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites.');
      setError('Failed to load favorites.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    }
  }, [user, token]);

  // Remove a single favorite (call DELETE /api/favorite/:id)
  const removeFromFavorites = async (favoriteId) => {
    setFavoriteDocs((prev) => prev.filter((fav) => fav._id !== favoriteId));
    toast.loading('Removing from favorites...', { id: favoriteId });

    try {
      const response = await axios.delete(`http://localhost:5000/api/favorites/${favoriteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        toast.success('Removed from favorites', { id: favoriteId });
        // Dispatch event for favorites update
        window.dispatchEvent(new Event('favoritesUpdated'));
      } else {
        toast.error(response.data.error || 'Favorite not found.', { id: favoriteId });
        fetchFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Could not remove favorite. Please try again.', { id: favoriteId });
      fetchFavorites();
    }
  };
  

  // Add to cart (placeholder logic)
  const addToCart = async (product) => {
    if (!user || !token) {
      toast.error('You must be logged in to add items to cart.');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        {
          customerId: user._id,
          products: [{ productId: product._id, quantity: 1 }],
          totalAmount: product.price
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Added "${product.name}" to cart!`);
      // Dispatch event for cart update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // Loading and Error states
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="flex-start" minHeight="60vh">
        <Button
          startIcon={<ArrowLeft />}
          variant="text"
          sx={{ mb: 2, mt: 2, ml: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Box flex={1} display="flex" justifyContent="center" alignItems="center" width="100%">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="flex-start" minHeight="60vh">
        <Button
          startIcon={<ArrowLeft />}
          variant="text"
          sx={{ mb: 2, mt: 2, ml: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Box flex={1} display="flex" justifyContent="center" alignItems="center" width="100%">
          <Typography variant="h6" color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  // A card to display each favorited product
  const ProductCard = ({ favorite }) => {
    const { _id: favoriteId, product } = favorite;

    if (!product) {
      // Safety check if there's no product data
      return null;
    }

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
          borderRadius: 2,
        }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '1/1' }}>
          <CardMedia
            component="img"
            image={product.images?.[0] || '/default.png'}
            alt={product.name}
            sx={{ objectFit: 'cover', cursor: 'pointer', width: '100%', height: '100%' }}
            onClick={() => navigate(`/products/${product._id}`)}
          />
          {/* Remove from favorites icon */}
          <IconButton
            onClick={() => removeFromFavorites(favoriteId)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&:hover': { backgroundColor: 'white', transform: 'scale(1.1)' },
              zIndex: 1
            }}
          >
            <Heart size={20} fill="#ff4081" color="#ff4081" />
          </IconButton>
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 2
          }}
        >
          {/* Artisan / user info */}
          {product.user && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/artisans/${product.user._id}`)}
            >
              <Avatar
                src={product.user.profilePicture || '/default.png'}
                alt={product.user.name || 'Artisan'}
                sx={{ width: 32, height: 32, mr: 1, border: '1px solid #e0e0e0' }}
              />
              <Typography variant="subtitle2" color="text.secondary">
                {product.user.name || 'Unknown Artisan'}
              </Typography>
            </Box>
          )}

          {/* Product name */}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/products/${product._id}`)}
          >
            {product.name}
          </Typography>

          {/* Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
            {product.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: 'action.selected' }} />
            ))}
          </Box>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.rating || 0}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.reviews || 0})
            </Typography>
          </Box>

          {/* Price & Add to Cart */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${Number(product.price || 0).toFixed(2)}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => addToCart(product)}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
                borderRadius: '8px'
              }}
            >
              <ShoppingCart size={20} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowLeft />}
        variant="text"
        sx={{ mb: 2, mt: 1 }}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="text.primary">
          My Favorites
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Tab label={`Products (${favoriteDocs.length})`} sx={{ fontWeight: activeTab === 0 ? 'bold' : 'normal' }} />
        </Tabs>
      </Box>

      
      {activeTab === 0 && (
        <>
          {favoriteDocs.length > 0 ? (
            <Grid container spacing={3}>
              {favoriteDocs.map((fav) => (
                <Grid item xs={12} sm={6} md={4} key={fav._id}>
                  <ProductCard favorite={fav} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                mt: 8,
                py: 4,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Your favorites list is empty.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find something you love on our <Link to="/shop" style={{ color: '#ff9800', textDecoration: 'none' }}>shop page</Link>.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Favorites;
