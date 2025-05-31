import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Rating,
  Divider,
  Button,
  IconButton,
  Tooltip,
  CardActionArea,
  Grow,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Star, Package, Users, Heart, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useUserAuth } from '../../UserAuthContext';

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserAuth();

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get('q');
    if (searchQuery) {
      fetchSearchResults(searchQuery);
      if (user) {
        fetchFavorites();
      }
    }
  }, [location.search, user]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/favorites/user/${user._id}`);
      const favoritesMap = {};
      response.data.forEach(fav => {
        favoritesMap[fav.productId] = fav;
      });
      setFavorites(favoritesMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFavoriteToggle = async (productId) => {
    if (!user) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (favorites[productId]) {
        await axios.delete(`http://localhost:5000/api/favorites/${favorites[productId]._id}`);
        const newFavorites = { ...favorites };
        delete newFavorites[productId];
        setFavorites(newFavorites);
        toast.success('Removed from favorites');
      } else {
        const response = await axios.post('http://localhost:5000/api/favorites', {
          userId: user._id,
          productId: productId
        });
        setFavorites({ ...favorites, [productId]: response.data });
        toast.success('Added to favorites');
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/cart', {
        userId: user._id,
        productId: productId,
        quantity: 1
      });
      toast.success('Added to cart');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const fetchSearchResults = async (query) => {
    setLoading(true);
    try {
      // Fetch products
      const productsResponse = await axios.get(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}`);
      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);

      // Fetch artisans
      const artisansResponse = await axios.get(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}&role=artisan`);
      setArtisans(Array.isArray(artisansResponse.data) ? artisansResponse.data : []);

      if (productsResponse.data.length === 0 && artisansResponse.data.length === 0) {
        toast.info('No results found for your search.');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setProducts([]);
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ProductCard = ({ product, index }) => (
    <Grow in timeout={300 + index * 50}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease-in-out",
          height: "100%",
          width: "100%",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <CardActionArea onClick={() => navigate(`/products/${product._id}`)}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              height="260"
              image={product.images[0]}
              alt={product.name}
              sx={{
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.03)" },
                aspectRatio: "1/1",
              }}
            />
            <Tooltip
              title={
                favorites[product._id]
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(product._id);
                }}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  backgroundColor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "white",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Heart
                  size={20}
                  fill={favorites[product._id] ? "#ff4081" : "none"}
                  color={favorites[product._id] ? "#ff4081" : "#666"}
                />
              </IconButton>
            </Tooltip>
            {!product.countInStock && (
              <Chip
                label="Out of Stock"
                color="error"
                size="small"
                sx={{ position: "absolute", left: 8, top: 8 }}
              />
            )}
          </Box>
          <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={product.user?.profilePicture}
                alt={product.user?.name}
                sx={{ width: 40, height: 40, mr: 1 }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                  {product.user?.name || "Unknown Artisan"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={14} color="#666" />
                  <Typography variant="caption" color="text.secondary">
                    {product.user?.address || "No address provided"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ml: "auto", textAlign: "right" }}>
                <Rating value={product.averageRating || 0} size="small" readOnly />
              </Box>
            </Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": { color: "primary.main" },
              }}
            >
              {product.name}
            </Typography>
            <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap" }}>
              {product.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
              }}
            >
              <Typography variant="h6" color="primary">
                ${product.price}
              </Typography>
              <Tooltip title={product.countInStock ? "Add to Cart" : "Out of Stock"}>
                <span>
                  <IconButton
                    color="primary"
                    disabled={!product.countInStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                    sx={{
                      backgroundColor: product.countInStock
                        ? "primary.main"
                        : "grey.200",
                      color: "white",
                      "&:hover": {
                        backgroundColor: product.countInStock
                          ? "primary.dark"
                          : "grey.200",
                      },
                    }}
                  >
                    <ShoppingCart size={20} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );

  const ArtisanCard = ({ artisan, index }) => (
    <Grow in timeout={300 + index * 50}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease-in-out",
          height: "100%",
          width: "100%",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <CardActionArea onClick={() => navigate(`/artisans/${artisan._id}`)}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              height="260"
              image={artisan.profilePicture || "https://via.placeholder.com/260"}
              alt={artisan.name}
              sx={{
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.03)" },
                aspectRatio: "1/1",
              }}
            />
            <Tooltip title="View Profile">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artisans/${artisan._id}`);
                }}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  backgroundColor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "white",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Users size={20} color="#666" />
              </IconButton>
            </Tooltip>
          </Box>
          <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={artisan.profilePicture}
                alt={artisan.name}
                sx={{ width: 40, height: 40, mr: 1 }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                >
                  {artisan.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={14} color="#666" />
                  <Typography variant="caption" color="text.secondary">
                    {artisan.address || "No address provided"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ml: "auto", textAlign: "right" }}>
                <Rating value={artisan.averageRating || 0} size="small" readOnly />
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                mb: 1,
              }}
            >
              {artisan.bio || "No bio available"}
            </Typography>
            <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap" }}>
              {artisan.specialties?.map((specialty) => (
                <Chip
                  key={specialty}
                  label={specialty}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Star size={16} color="#666" />
                  <Typography variant="body2">{artisan.averageRating || 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Package size={16} color="#666" />
                  <Typography variant="body2">{artisan.totalOrders || 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Users size={16} color="#666" />
                  <Typography variant="body2">{artisan.totalReviews || 0}</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artisans/${artisan._id}`);
                }}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                View Profile
              </Button>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const searchQuery = new URLSearchParams(location.search).get('q');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Search Results for "{searchQuery}"
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              minWidth: 200,
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label={`Products (${products.length})`} />
          <Tab label={`Artisans (${artisans.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          {products.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No products found matching your search.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {products.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard product={product} index={index} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <>
          {artisans.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No artisans found matching your search.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {artisans.map((artisan, index) => (
                <Grid item xs={12} sm={6} md={4} key={artisan._id}>
                  <ArtisanCard artisan={artisan} index={index} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchResults; 