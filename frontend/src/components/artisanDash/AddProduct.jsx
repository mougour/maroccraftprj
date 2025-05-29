import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Paper, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        console.log('Fetched categories:', response.data);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('countInStock', formData.stock);

    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user._id) {
      data.append('user', user._id);
    } else {
      toast.error('User not logged in.');
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authorization token not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      toast.success('Product added successfully!');
      setFormData({ name: '', description: '', price: '', category: '', stock: '' });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add product.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Product
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            type="number"
            required
          />
           <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Select a Category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Stock Quantity"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            margin="normal"
            type="number"
            required
          />

          <FormControl fullWidth margin="normal">
            <Typography variant="subtitle2" gutterBottom>Product Images</Typography>
            <InputLabel shrink>{`Select Images (up to 5)`}</InputLabel>
            <Input
              type="file"
              inputProps={{ multiple: true, accept: 'image/*' }}
              onChange={handleFileChange}
            />
          </FormControl>

          {selectedFiles.length > 0 && (
            <FormHelperText>Selected: {selectedFiles.map(file => file.name).join(', ')}</FormHelperText>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddProduct; 