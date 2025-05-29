import { Container, Grid, Typography, Card, CardMedia, CardContent, Box, Button, CircularProgress } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Collections = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Categories - MAROCRAFT';

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${category.name}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography>Loading Categories...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="normal" color="text.primary">
          Explore Our Artisan Crafts
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Discover unique handcrafted products from talented artisans across Morocco.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Card
              elevation={1}
              sx={{
                height: '100%',
                minHeight: 100,
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4,
                  cursor: 'pointer'
                },
                borderRadius: 2,
                overflow: 'hidden',
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <CardMedia
                component="img"
                height="333"
                image={category.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                alt={category.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowRight size={20} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category);
                  }}
                  sx={{ mt: 'auto' }}
                >
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Collections;