import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Rating,
  Drawer,
  Checkbox,
  Slider,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Breadcrumbs,
  Link as MUILink,
  Chip,
  Paper,
  InputBase,
  Avatar,
  Tooltip,
  CircularProgress,
  Grow,
} from "@mui/material";
import {
  Heart,
  ShoppingCart,
  Filter,
  Search,
  Star,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const categories = [
  "All Categories",
  "Zellige Crafting",
  "Tadelakt Plastering",
  "Wood Carving",
  "Leatherwork",
  "Metalwork",
  "Pottery & Ceramics",
  "Textile Weaving",
  "Jewelry Making",
  "Traditional Clothing Tailoring",
  "Basket Weaving",
  "Carpet & Rug Making",
  "Painting & Calligraphy",
  "Natural Cosmetics & Soap",
  "Traditional Musical Instruments",
  "Glass & Mirror Decoration",
];

const Products = () => {
  // Set the document title.
  useEffect(() => {
    document.title = "Shop - MAROCRAFT";
  }, []);

  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState([
    "All Categories",
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // For showing a loading state
  const navigate = useNavigate();
  const location = useLocation(); // Import useLocation

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    const categoryParam = params.get("category"); // Read the category parameter

    setSearchQuery(decodeURIComponent(query));

    // Set selected categories based on URL parameter
    if (categoryParam) {
      // Find the exact category name from the predefined list (case-insensitive match)
      const matchedCategory = categories.find(
        cat => cat.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategories([matchedCategory]);
      } else {
        // If category param is invalid or not found, default to All Categories
        setSelectedCategories(["All Categories"]);
      }
    } else {
      // If no category param, default to All Categories
      setSelectedCategories(["All Categories"]);
    }

    // Fetch products when search query or category changes
    fetchProducts();
  }, [location.search]); // Depend on location.search to re-run when URL changes

  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  // Add to cart function
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

  // Update handleAddToCart to use the new addToCart function
  const handleAddToCart = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found.");
      return;
    }
    await addToCart(product);
  };

  // Toggle favorite for a product.
  const handleFavoriteToggle = async (productId) => {
    if (!user) {
      toast.error("You must be logged in to favorite products.");
      return;
    }
    const product = products.find((p) => p.id === productId);
    try {
      if (!product.isFavorite) {
        const response = await axios.post(
          "http://localhost:5000/api/favorites",
          { product: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to favorites");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, isFavorite: true, favoriteId: response.data._id }
              : p
          )
        );
        // Dispatch event for favorites update
        window.dispatchEvent(new Event('favoritesUpdated'));
      } else {
        await axios.delete(
          `http://localhost:5000/api/favorites/${product.favoriteId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Removed from favorites");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, isFavorite: false, favoriteId: null }
              : p
          )
        );
        // Dispatch event for favorites update
        window.dispatchEvent(new Event('favoritesUpdated'));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Error updating favorites. Please try again.");
    }
  };

  // Update price range.
  const handlePriceChange = (event, newValue) => setPriceRange(newValue);

  // Update categories selection.
  const handleCategoryChange = (category) => {
    if (category === "All Categories") {
      setSelectedCategories(["All Categories"]);
    } else {
      let newCategories = selectedCategories.filter(
        (c) => c !== "All Categories"
      );
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter((c) => c !== category);
      } else {
        newCategories = [...newCategories, category];
      }
      if (newCategories.length === 0) {
        newCategories = ["All Categories"];
      }
      setSelectedCategories(newCategories);
    }
  };

  // Fetch products and merge with the user's favorites.
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      const formattedProducts = data.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price || 0,
        rating: product.averageRating || 3,
        reviews: product.numReviews || 0,
        image: product.images[0] || "",
        artisan: {
          id: product.user?._id || 0,
          name: product.user?.name || "Unknown",
          avatar: product.user?.profilePicture || "",
          location: product.user?.address || "Canada, Ontario",
          rating: product.averageRating || 3,
          reviews: product.artisanReviews || 125,
        },
        category: product.category?.name || "Uncategorized",
        tags: product.tags || [],
        inStock: product.countInStock > 0,
        isFavorite: false,
        favoriteId: null,
      }));

      if (user && token) {
        const favResponse = await axios.get(
          `http://localhost:5000/api/favorites/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const favoritesData = favResponse.data;
        const favoritesMap = {};
        favoritesData.forEach((fav) => {
          favoritesMap[fav.product._id] = fav._id;
        });
        formattedProducts.forEach((prod) => {
          if (favoritesMap[prod.id]) {
            prod.isFavorite = true;
            prod.favoriteId = favoritesMap[prod.id];
          }
        });
      }

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering UI (Sidebar/Drawer)
  const FilterContent = () => (
    <Box sx={{ p: 2 }}>
      {/* Search */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          p: 1,
          mb: 3,
        }}
      >
        <Search size={20} color="#666" />
        <InputBase
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ ml: 1, flex: 1 }}
        />
      </Box>
      {/* Categories */}
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Categories
      </Typography>
      <FormGroup>
        {categories.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">{category}</Typography>
            }
            sx={{ mb: 0.5 }}
          />
        ))}
      </FormGroup>
      <Divider sx={{ my: 3 }} />
      {/* Price Range */}
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Price Range
      </Typography>
      <Slider
        value={priceRange}
        onChange={handlePriceChange}
        valueLabelDisplay="auto"
        min={0}
        max={3000}
        sx={{ mt: 1 }}
        valueLabelFormat={(value) => `$${value}`}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="body2" color="text.secondary">${priceRange[0]}</Typography>
        <Typography variant="body2" color="text.secondary">${priceRange[1]}</Typography>
      </Box>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 4 }}
        onClick={() => setDrawerOpen(false)}
      >
        Apply Filters
      </Button>
    </Box>
  );

  // Product Card Component.
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
        {/* Make the entire card clickable via CardActionArea */}
        <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              height="260"
              image={product.image}
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
                product.isFavorite
                  ? "Remove from Favorites"
                  : "Add to Favorites"
              }
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevent CardActionArea click
                  handleFavoriteToggle(product.id);
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
                  fill={product.isFavorite ? "#ff4081" : "none"}
                  color={product.isFavorite ? "#ff4081" : "#666"}
                />
              </IconButton>
            </Tooltip>
            {!product.inStock && (
              <Chip
                label="Out of Stock"
                color="error"
                size="small"
                sx={{ position: "absolute", left: 8, top: 8 }}
              />
            )}
          </Box>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
          >
            {/* Artisan Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/artisans/${product.artisan.id}`);
              }}
            >
              <Avatar
                src={product.artisan.avatar}
                alt={product.artisan.name}
                sx={{ width: 40, height: 40, mr: 1, cursor: "pointer" }}
              />
              <Box sx={{ cursor: "pointer" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    transition: "color 0.2s ease-in-out",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {product.artisan.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MapPin size={14} color="#666" />
                  <Tooltip title={product.artisan.location}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: 120, // adjust as needed
                      }}
                    >
                      {product.artisan.location}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ ml: "auto", textAlign: "right" }}>
                <Rating value={product.rating} size="small" readOnly />
                {/* <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {product.artisan.reviews} reviews
                </Typography> */}
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
              {product.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
            {/* <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Rating
                value={product.rating}
                precision={0.5}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviews})
              </Typography>
            </Box> */}
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
              <Tooltip title={product.inStock ? "Add to Cart" : "Out of Stock"}>
                <span>
                  <IconButton
                    color="primary"
                    disabled={!product.inStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                    sx={{
                      backgroundColor: product.inStock
                        ? "primary.main"
                        : "grey.200",
                      color: "white",
                      "&:hover": {
                        backgroundColor: product.inStock
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

  // Compute filtered products based on price, category, and search query.
  const filteredProducts = products.filter((product) => {
    const withinPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const categoryMatch =
      selectedCategories.includes("All Categories") ||
      selectedCategories.includes(product.category);
    const searchMatch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.join(" ").toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return withinPrice && categoryMatch && searchMatch;
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { sm: "none" } }}
      >
        <Box sx={{ width: 280 }}>
          <FilterContent />
        </Box>
      </Drawer>
      {/* Desktop Filters Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 280,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          borderRight: "1px solid #eee",
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: 64,
          overflowY: "auto",
        }}
      >
        <FilterContent />
      </Paper>
      {/* Main Products Grid */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Container maxWidth="xl">
          {/* Header & Breadcrumbs */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <MUILink underline="hover" color="inherit" href="/">
                Home
              </MUILink>
              <Typography color="text.primary">Shop</Typography>
            </Breadcrumbs>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" gutterBottom>
                All Products
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" startIcon={<Star />}>
                  Popular
                </Button>
                <Button variant="outlined" startIcon={<ArrowUpRight />}>
                  Latest
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Mobile Filter Button */}
          <Box sx={{ display: { sm: "none" }, mb: 2 }}>
            <Button
              startIcon={<Filter />}
              variant="outlined"
              onClick={() => setDrawerOpen(true)}
              fullWidth
            >
              Filters
            </Button>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Products Grid */}
          {!loading && (
            <>
              {filteredProducts.length === 0 ? (
                // No Products Found
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search to find what you're
                    looking for.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {filteredProducts.map((product, index) => (
                    <Grid item xs={12} sm={12} md={6} lg={4} key={product.id}>
                      <ProductCard product={product} index={index} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Products;
