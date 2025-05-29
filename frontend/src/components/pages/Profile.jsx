import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Paper, Grid, Button, TextField } from '@mui/material';
import { useUserAuth } from '../../UserAuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, updateProfilePicture } = useUserAuth();
  const fileInputRef = useRef(null);
  const token = sessionStorage.getItem('token');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
    specialty: '',
    instagram: '',
    twitter: '',
    website: ''
  });
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || '',
        specialty: user.specialty || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        website: user.socialLinks?.website || ''
      });
      setProfilePicture(user.profilePicture || '/default.png');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id || !token) return;

    const form = new FormData();
    form.append('image', file);

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/profile/upload/${user._id}`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageUrl = response.data.imageUrl;
      if (imageUrl) {
        setProfilePicture(imageUrl);
        updateProfilePicture(imageUrl);
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error('Try a different image!');
      }

    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Error uploading profile picture.');
    } finally {
       setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { ...formData };
      if (password) {
        updateData.password = password;
      }
      const response = await axios.put(
        `http://localhost:5000/api/register/${user?._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || '',
        specialty: user.specialty || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        website: user.socialLinks?.website || ''
      });
      setPassword('');
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h5">You must be logged in to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f5f5f5" p={3}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 700 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={4}>
          <Box position="relative">
            <Avatar
              src={profilePicture}
              alt={user.name}
              sx={{ width: 120, height: 120, mb: 2, border: '4px solid #FFD700' }}
            />
             <Button
              variant="contained"
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                minWidth: 0,
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: '#FFB636',
                '&:hover': { bgcolor: '#F5A623' },
                p: 0
              }}
              onClick={handleCameraClick}
            >
              <Camera size={18} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePictureUpload}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {user.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Role: {user.role === 'artisan' ? 'Artisan' : user.role === 'customer' ? 'Customer' : 'User'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
               <TextField
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                disabled // Email is often not editable
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                fullWidth
                placeholder="Enter new password to change"
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      size="small"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  ),
                }}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            {user.role === 'artisan' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                 <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} mt={2} mb={1}>Social Links</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                       <TextField
                        label="Twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                       <TextField
                        label="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}

            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 