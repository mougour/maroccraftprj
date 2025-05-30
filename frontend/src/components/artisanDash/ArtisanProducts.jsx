import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Autocomplete,
  Chip,
  useTheme,
  InputLabel,
  FormControl,
  FormHelperText,
  Input,
  Select,
} from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ----------------------------------
// ProductCard Component
// ----------------------------------
function ProductCard({ product, onEdit, onDelete, onCardClick }) {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 6,
          cursor: 'pointer',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onCardClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          product.images && product.images[0]
            ? product.images[0]
            : 'https://via.placeholder.com/400'
        }
        alt={product.name}
        sx={{ objectFit: 'cover', aspectRatio: '1/1' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
          {product.name}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.category && product.category.name && (
            <Chip
              label={product.category.name}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {Array.isArray(product.tags) &&
            product.tags.map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" variant="outlined" />
            ))}
        </Box>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
            noWrap
          >
            {product.description}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ${product.price}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stock: {product.countInStock}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={e => { e.stopPropagation(); onEdit(); }} color="primary" size="small">
          <Edit size={18} />
        </IconButton>
        <IconButton onClick={e => { e.stopPropagation(); onDelete(); }} color="error" size="small">
          <Trash2 size={18} />
        </IconButton>
      </CardActions>
    </Card>
  );
}

// ----------------------------------
// Main Dashboard Component
// ----------------------------------
const UserDash = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [fetchedCategories, setFetchedCategories] = useState([]);

  // For product details in the add form:
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    tags: [],
  });
  // File uploads for new product:
  const [newProductImages, setNewProductImages] = useState([]);
  // File uploads in edit dialog:
  const [editProductImages, setEditProductImages] = useState([]);

  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    document.title = 'My Products - MAROCAFT';
  }, []);

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        console.log('Fetched categories for dialog:', response.data);
        setFetchedCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories for dialog:', error);
        toast.error('Failed to load categories for the form.');
      }
    };

    fetchCategories();
  }, []);

  // ---------------------------
  // Fetch Products Data
  // ---------------------------
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // File Handlers
  // ---------------------------
  const handleNewProductImageChange = (e) => {
    setNewProductImages(Array.from(e.target.files));
  };

  const handleEditProductImageChange = (e) => {
    setEditProductImages(Array.from(e.target.files));
  };

  // ---------------------------
  // Add Product Handler
  // ---------------------------
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('countInStock', newProduct.stock);
      formData.append('description', newProduct.description);
      formData.append('user', user._id);
      formData.append('tags', newProduct.tags.join(','));

      newProductImages.forEach((file) => formData.append('images', file));

      await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Product added successfully!');
      setOpenAddDialog(false);
      setNewProduct({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        tags: [],
      });
      setNewProductImages([]);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error adding product';
      toast.error(errorMessage);
    }
  };

  // ---------------------------
  // Edit Product Handler
  // ---------------------------
  const handleEditProduct = async () => {
    if (!selectedProduct.name || !selectedProduct.price || !selectedProduct.category || !selectedProduct.stock) {
      toast.error('Please fill in all required fields for editing.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', selectedProduct.name);
      formData.append('price', selectedProduct.price);
      formData.append('category', selectedProduct.category);
      formData.append('countInStock', selectedProduct.stock);
      formData.append('description', selectedProduct.description);
      formData.append('tags', (selectedProduct.tags || []).join(','));

      if (editProductImages.length > 0) {
        editProductImages.forEach((file) => formData.append('images', file));
      }

      await axios.put(
        `http://localhost:5000/api/products/${selectedProduct._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Product updated successfully!');
      setOpenEditDialog(false);
      setSelectedProduct(null);
      setEditProductImages([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error updating product';
      toast.error(errorMessage);
    }
  };

  // ---------------------------
  // Delete Product Handler
  // ---------------------------
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
        toast.success('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Error deleting product';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
      }}
    >
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="primary">
              My Products
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => setOpenAddDialog(true)}
              sx={{
                textTransform: 'none',
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              Add Product
            </Button>
          </Box>

          {products.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: '#fff',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No products found. Click "Add Product" to create one.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard
                    product={product}
                    onEdit={() => {
                      setSelectedProduct({
                        ...product,
                        category: product.category ? product.category._id : '',
                        stock: product.countInStock,
                        tags: Array.isArray(product.tags)
                          ? product.tags
                          : product.tags
                              .split(',')
                              .map((t) => t.trim()),
                      });
                      setOpenEditDialog(true);
                    }}
                    onDelete={() => handleDelete(product._id)}
                    onCardClick={() => navigate(`/products/${product._id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Add Product Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 'bold',
          }}
        >
          Add New Product
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              label="Product Name"
              placeholder="e.g., Handmade Vase"
              fullWidth
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              variant="outlined"
              required
            />
            <TextField
              label="Price"
              type="number"
              placeholder="e.g., 50"
              fullWidth
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              variant="outlined"
              required
            />
            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              >
                 <MenuItem value="">
                  <em>Select a Category</em>
                </MenuItem>
                {fetchedCategories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Stock"
              type="number"
              placeholder="e.g., 100"
              fullWidth
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
              variant="outlined"
              required
            />
            <TextField
              label="Description"
              placeholder="Short description of your product"
              multiline
              rows={4}
              fullWidth
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              variant="outlined"
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={newProduct.tags}
              onChange={(event, newValue) =>
                setNewProduct({ ...newProduct, tags: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  variant="outlined"
                  helperText="Press Enter to add a tag"
                />
              )}
            />
            <FormControl fullWidth margin="normal">
             <Typography variant="subtitle2" gutterBottom>Product Images</Typography>
             <InputLabel shrink>Select Images (up to 5)</InputLabel>
             <Input
               type="file"
               inputProps={{ multiple: true, accept: 'image/*' }}
               onChange={handleNewProductImageChange}
             />
            </FormControl>
            {newProductImages.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {newProductImages.map((file, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="caption">{file.name}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            fontWeight: 'bold',
          }}
        >
          Edit Product
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Box
              component="form"
              sx={{
                pt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                label="Product Name"
                placeholder="e.g., Handmade Vase"
                fullWidth
                value={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, name: e.target.value })
                }
                variant="outlined"
                required
              />
              <TextField
                label="Price"
                type="number"
                placeholder="e.g., 50"
                fullWidth
                value={selectedProduct.price}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, price: e.target.value })
                }
                variant="outlined"
                required
              />
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={selectedProduct.category}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      category: e.target.value,
                    })
                  }
                >
                   <MenuItem value="">
                    <em>Select a Category</em>
                  </MenuItem>
                  {fetchedCategories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Stock"
                type="number"
                placeholder="e.g., 100"
                fullWidth
                value={selectedProduct.stock}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    stock: e.target.value,
                  })
                }
                variant="outlined"
                required
              />
              <TextField
                label="Description"
                placeholder="Short description of your product"
                multiline
                rows={4}
                fullWidth
                value={selectedProduct.description}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    description: e.target.value,
                  })
                }
                variant="outlined"
              />
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={selectedProduct.tags}
                onChange={(event, newValue) =>
                  setSelectedProduct({ ...selectedProduct, tags: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    variant="outlined"
                    helperText="Press Enter to add a tag"
                  />
                )}
              />
              <FormControl fullWidth margin="normal">
               <Typography variant="subtitle2" gutterBottom>Product Images</Typography>
               <InputLabel shrink>Select Images (up to 5)</InputLabel>
               <Input
                 type="file"
                 multiple
                 hidden
                 onChange={handleEditProductImageChange}
               />
              </FormControl>
              {editProductImages.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {editProductImages.map((file, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="caption">{file.name}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                 <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom width="100%">Existing Images:</Typography>
                   {selectedProduct.images.map((imageUrl, index) => (
                    <Box key={index} component="img" src={imageUrl} alt={`Existing ${index + 1}`} sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }} />
                   ))}
                 </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleEditProduct}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDash;
