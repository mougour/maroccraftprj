import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdEmail, MdLock } from 'react-icons/md';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../UserAuthContext';

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

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending login request with data:', formData);
      
      const response = await axios.post('http://localhost:5000/api/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        // Call login function from context with the complete user data
        login(response.data, response.data.token);
        
        toast.success('Login successful!');
        
        // Redirect based on user role
        switch (response.data.role) {
          case 'artisan':
            navigate('/artisan-dashboard');
            break;
          case 'customer':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Login failed';
        console.error('Error response:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
          Login to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
            placeholder="Enter your email"
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
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            placeholder="Enter your password"
            sx={textFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdLock style={{ color: '#fbc02d' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                textDecoration: 'none', 
                color: '#fbc02d',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: '#f9a825',
                }
              }}
            >
              <Typography variant="body2">
                Forgot your password?
              </Typography>
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={buttonStyles}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
              Don&apos;t have an account?
            </Typography>
            <Link 
              to="/register" 
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
              Create new account
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
