import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdEmail, MdLock, MdPerson, MdLocationOn, MdPhone, MdDescription, MdPhotoCamera } from 'react-icons/md';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  Avatar,
  Chip,
} from '@mui/material';

// --- Specialties list from Artisans component ---
const specialties = [
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

// --- Logo Component ---
const Logo = () => (
  <Box sx={{ textAlign: 'center', mb: 3 }}>
    <Typography
      variant="h3"
      sx={{
        fontWeight: 900,
        background: 'linear-gradient(45deg, #FFD700, #FF8C00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '2px',
        fontFamily: '"Montserrat", sans-serif',
        textTransform: 'uppercase',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
      }}
    >
      MAROCRAFT
    </Typography>
  </Box>
);

// --- Main Register Form Component ---
export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    profilePicture: '/default.png',
    // Additional fields for artisans
    phone: '',
    address: '',
    description: '',
    specialties: [],
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('/default.png');

  const containerStyles = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
    py: 4,
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  };

  const paperStyles = {
    px: { xs: 2, sm: 4 },
    py: 3,
    maxWidth: 500,
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  };

  const buttonStyles = {
    mt: 3,
    mb: 2,
    backgroundColor: '#fbc02d',
    color: '#fff',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '8px',
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(251, 192, 45, 0.3)',
    '&:hover': {
      backgroundColor: '#f9a825',
      boxShadow: '0 6px 16px rgba(251, 192, 45, 0.4)',
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.3s ease',
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#fbc02d',
        },
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#fbc02d',
          borderWidth: '2px',
        },
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#fbc02d',
    },
  };

  const toggleButtonStyles = {
    '& .MuiToggleButton-root': {
      color: '#757575',
      border: '1px solid #e0e0e0',
      borderRadius: '8px !important',
      padding: '8px 24px',
      fontSize: '0.9rem',
      fontWeight: 500,
      textTransform: 'none',
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        backgroundColor: '#fbc02d',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(251, 192, 45, 0.3)',
        '&:hover': {
          backgroundColor: '#f9a825',
        },
      },
      '&:hover': {
        backgroundColor: 'rgba(251, 192, 45, 0.1)',
      },
    },
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name}:`, value); // Debug log
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role selection
  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData((prev) => ({ ...prev, role: newRole }));
    }
  };

  // Handle specialties selection
  const handleSpecialtiesChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      specialties: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug log for form data
    console.log('Current form data:', formData);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      console.log('Validation failed:', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Additional validation for artisans
    if (formData.role === 'artisan') {
      if (!formData.phone || !formData.address || !formData.description || formData.specialties.length === 0) {
        toast.error('Please fill in all artisan-specific fields, including specialties');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Prepare the request data
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        profilePicture: formData.profilePicture instanceof File ? '/default.png' : formData.profilePicture,
      };

      // Add artisan-specific fields if role is artisan
      if (formData.role === 'artisan') {
        requestData.phone = formData.phone.trim();
        requestData.address = formData.address.trim();
        requestData.description = formData.description.trim();
        requestData.specialties = formData.specialties;
      }

      // Log the request data
      console.log('Sending request data:', requestData);

      const response = await axios.post('http://localhost:5000/api/register', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Registration response:', response.data);

      toast.success('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Request data:', error.config?.data);
        const errorMessage = error.response?.data?.error || 'Registration failed';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={containerStyles}>
      <Paper elevation={3} sx={paperStyles}>
        <Logo />
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: '#333',
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}
        >
          Create your account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Profile Picture Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="profile-picture-upload">
              <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                <Avatar
                  src={previewUrl}
                  sx={{
                    width: 100,
                    height: 100,
                    border: '2px solid #fbc02d',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#fbc02d',
                    borderRadius: '50%',
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MdPhotoCamera sx={{ color: 'white' }} />
                </Box>
              </Box>
            </label>
            <Typography variant="caption" sx={{ mt: 1, color: '#666' }}>
              Click to upload profile picture
            </Typography>
          </Box>

          {/* Role Selection */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ToggleButtonGroup
              value={formData.role}
              exclusive
              onChange={handleRoleChange}
              aria-label="user role"
              sx={toggleButtonStyles}
            >
              <ToggleButton value="customer" aria-label="customer">
                Customer
              </ToggleButton>
              <ToggleButton value="artisan" aria-label="artisan">
                Artisan
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Basic Fields */}
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            type="text"
            autoComplete="name"
            required
            margin="normal"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            sx={textFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdPerson style={{ color: '#fbc02d' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            required
            margin="normal"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            sx={textFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdEmail style={{ color: '#fbc02d' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            margin="normal"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            sx={textFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdLock style={{ color: '#fbc02d' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            margin="normal"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            sx={textFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdLock style={{ color: '#fbc02d' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Artisan-specific Fields */}
          <Collapse in={formData.role === 'artisan'}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              required={formData.role === 'artisan'}
              margin="normal"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdPhone style={{ color: '#fbc02d' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              type="text"
              required={formData.role === 'artisan'}
              margin="normal"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdLocationOn style={{ color: '#fbc02d' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              required={formData.role === 'artisan'}
              margin="normal"
              placeholder="Tell us about your craft and experience"
              value={formData.description}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdDescription style={{ color: '#fbc02d' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Specialties Multi-Select */}
            <FormControl fullWidth margin="normal" variant="outlined" sx={textFieldStyles}>
              <InputLabel id="specialties-label">Specialties</InputLabel>
              <Select
                labelId="specialties-label"
                id="specialties"
                multiple
                name="specialties"
                value={formData.specialties}
                onChange={handleSpecialtiesChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                }}
              >
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Collapse>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={buttonStyles}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
              Already have an account?
            </Typography>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: '#fbc02d',
                fontWeight: 600,
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: '#f9a825',
                }
              }}
            >
              Sign in
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
