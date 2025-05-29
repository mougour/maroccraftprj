import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Grid } from '@mui/material';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    // Add other product fields here (e.g., images, category, tags, etc.)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (response.data) {
          setProduct(response.data);
          // Pre-fill the form data with existing product details
          setFormData({
            name: response.data.name || '',
            description: response.data.description || '',
            price: response.data.price || '',
            // Set other fields from response.data
          });
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product for editing:', err);
        setError('Failed to load product for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]); // Re-fetch if the product ID changes

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (Update product)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/products/${id}`, formData);
      if (response.data.success) {
        toast.success('Product updated successfully!');
        navigate(`/products/${id}`); // Navigate back to product detail page
      } else {
        toast.error(response.data.error || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Error updating product. Please try again.');
    } finally {
      setLoading(false);
    }
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

  if (!product) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="text.secondary">Product data could not be loaded.</Typography>
        </Box>
      );
  }


  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box maxWidth="md" sx={{ mx: "auto" }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">Edit Product</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              {/* Add other form fields here (e.g., for images, category, tags) */}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                 <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate(`/products/${id}`)} // Cancel and go back
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditProduct; 