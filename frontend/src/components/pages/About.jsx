import { Container, Grid, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'About Us - MAROCRAFT';
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Grid container spacing={4} justifyContent="center" textAlign="center" mb={6}>
        <Grid item xs={12} md={8}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(45deg, #FFD700, #FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1.5px',
              fontFamily: '"Playfair Display", serif',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            MAROCRAFT
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Preserving Moroccan Heritage Through Authentic Handcrafted Products
          </Typography>
        </Grid>
      </Grid>

      {/* Story Section */}
      <Grid container spacing={6} alignItems="center" mb={8}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1607619056575-2c0fc270f19a"
            alt="Moroccan artisan work"
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Our Story
          </Typography>
          <Typography paragraph>
            MAROCRAFT was born from a deep appreciation for Moroccan craftsmanship and a desire to share this rich cultural heritage with the world. We connect talented Moroccan artisans with global customers who value authentic, handcrafted products.
          </Typography>
          <Typography paragraph>
            Each piece in our marketplace tells a story — of tradition, skill, and the dedication of our artisans who have mastered their craft through generations.
          </Typography>

          {[ 
            "100% Authentic Moroccan Products",
            "Direct Support to Local Artisans",
            "Fair Trade Practices"
          ].map((text, index) => (
            <Box key={index} display="flex" alignItems="center" mb={1}>
              <CheckCircle size={20} color="#1976d2" style={{ marginRight: 8 }} />
              <Typography>{text}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      {/* Mission Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" gutterBottom>
          Our Mission
        </Typography>
      </Box>
      <Grid container spacing={4} mb={8}>
        {[
          {
            title: 'Empower Artisans',
            icon: '🤝',
            text: 'We provide a platform for Moroccan artisans to showcase their work and reach a global audience.',
          },
          {
            title: 'Preserve Culture',
            icon: '🌍',
            text: 'We help preserve traditional Moroccan craftsmanship and cultural heritage.',
          },
          {
            title: 'Quality & Authenticity',
            icon: '❤️',
            text: 'We ensure every product meets our high standards of quality and authenticity.',
          },
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h3" mb={2}>{item.icon}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.text}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Values Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" gutterBottom>
          Our Values
        </Typography>
      </Box>
      <Grid container spacing={4} mb={8}>
        {[
          {
            title: 'Sustainability',
            text: 'We promote sustainable practices by supporting local artisans and using traditional, eco-friendly materials and techniques.',
          },
          {
            title: 'Community',
            text: 'We build strong relationships with our artisan community, ensuring fair compensation and opportunities for growth.',
          },
        ].map((item, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card elevation={2}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.text}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Box textAlign="center" mt={8}>
        <Typography variant="h4" gutterBottom>
          Join Our Journey
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Be part of our mission to preserve Moroccan craftsmanship and support local artisans.
        </Typography>
        <Button variant="contained" color="primary" size="large" endIcon={<ArrowRight />}>
          Join Our Community
        </Button>
      </Box>
    </Container>
  );
};

export default About;
