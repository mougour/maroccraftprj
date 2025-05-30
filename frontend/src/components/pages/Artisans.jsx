import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  InputBase,
  IconButton,
  Paper,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  Grid,
} from '@mui/material';
import { 
  MapPin, 
  Star, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Award,
  Package,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const specialties = [
  'All',
  'Zellige Crafting',
  'Tadelakt Plastering',
  'Wood Carving',
  'Leatherwork',
  'Metalwork',
  'Pottery & Ceramics',
  'Textile Weaving',
  'Jewelry Making',
  'Traditional Clothing Tailoring',
  'Basket Weaving',
  'Carpet & Rug Making',
  'Painting & Calligraphy',
  'Natural Cosmetics & Soap',
  'Traditional Musical Instruments',
  'Glass & Mirror Decoration',
];

const sortOptions = [
  { value: 'rating-desc', label: 'Highest Rated', icon: <Star size={16} /> },
  { value: 'orders-desc', label: 'Most Orders', icon: <Package size={16} /> },
  { value: 'reviews-desc', label: 'Most Reviews', icon: <Users size={16} /> },
  { value: 'name-asc', label: 'Name (A-Z)', icon: <SortAsc size={16} /> },
  { value: 'name-desc', label: 'Name (Z-A)', icon: <SortDesc size={16} /> },
];

const Artisans = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        const filteredArtisans = response.data.filter(user => user.role === 'artisan');
        
        // Use image URLs directly from backend
        const artisansWithFullImages = filteredArtisans.map(artisan => ({
          ...artisan,
          // Use the image paths directly as provided by the backend
          coverImage: artisan.coverImage,
          profilePicture: artisan.profilePicture,
        }));

        console.log('Fetched and filtered artisans:', artisansWithFullImages); 
        setArtisans(artisansWithFullImages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching artisans:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArtisans();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <CircularProgress />
    </div>
  );

  if (error) return (
    <div className="p-4">
      <Alert severity="error">Error: {error}</Alert>
    </div>
  );

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header Section */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold mb-2">
          Discover Our Artisans
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Explore the talented craftsmen and women who bring traditional Moroccan artistry to life
        </Typography>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search Bar */}
        <Paper className="flex-1 min-w-[200px]">
          <div className="flex items-center px-4 py-2">
            <Search size={20} className="text-gray-400 mr-2" />
            <InputBase
              placeholder="Search artisans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </Paper>

        {/* Specialty Filter */}
        <FormControl className="min-w-[200px]">
          <Select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            displayEmpty
            className="bg-white"
          >
            {specialties.map((specialty) => (
              <MenuItem key={specialty} value={specialty}>
                {specialty}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Options */}
        <FormControl className="min-w-[200px]">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            displayEmpty
            className="bg-white"
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Artisans Grid */}
      <Grid container spacing={4}>
        {artisans.map((artisan) => (
          <Grid item xs={12} sm={6} md={4} key={artisan._id}>
            <Card 
              className="h-full transition-all duration-300 hover:shadow-xl"
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(0,0,0,0.05)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }
              }}
            >
              {/* Image */}
              <CardMedia
                component="img"
                height="180"
                image={artisan.profilePicture || 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                alt={artisan.name}
                className="object-cover w-full"
              />

              <CardContent className="flex-grow p-4">
                {/* Name */}
                <Typography variant="h6" className="font-bold mb-2 text-center">
                  {artisan.name}
                </Typography>

                {/* Rating/Reviews */}
                <div className="flex items-center justify-center mb-3">
                  <Tooltip title="Rating">
                    <div className="flex items-center">
                      <Star size={18} className="text-yellow-500 mr-1" />
                      <Typography variant="body2" className="font-semibold">
                        {artisan.rating?.toFixed(1) || '0.0'} ({artisan.reviewCount || 0})
                      </Typography>
                    </div>
                  </Tooltip>
                </div>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  className="mb-3 line-clamp-3 text-center"
                  sx={{
                    color: '#555',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                >
                  {artisan.description || 'No description available'}
                </Typography>

                {/* Specialties */}
                <div className="mb-4 flex flex-wrap justify-center gap-1">
                  {artisan.specialties?.map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        color: '#B8860B',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        }
                      }}
                    />
                  ))}
                </div>

                {/* View Profile Button */}
                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowRight size={20} />}
                  onClick={() => navigate(`/artisans/${artisan._id}`)}
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700 30%, #FFC800 90%)',
                    color: '#000',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFC800 30%, #FFD700 90%)',
                      boxShadow: '0 6px 16px rgba(255, 215, 0, 0.3)',
                    }
                  }}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <Pagination
          count={Math.ceil(artisans.length / 9)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: '8px',
              margin: '0 4px',
              '&.Mui-selected': {
                backgroundColor: '#FFD700',
                color: '#000',
                '&:hover': {
                  backgroundColor: '#FFC800',
                }
              }
            }
          }}
        />
      </div>
    </Container>
  );
};

export default Artisans;