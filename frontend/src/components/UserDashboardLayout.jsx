import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../UserAuthContext';
import ArtisanSidebar from '../scenes/global/ArtisanSidebar';
import CustomerSidebar from '../scenes/global/CustomerSidebar';
import { Box } from '@mui/material';

const UserDashboardLayout = ({ children }) => {
  const { user } = useUserAuth();

  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // Determine which sidebar to show based on user role
  const SidebarComponent = user.role === 'artisan' ? ArtisanSidebar : CustomerSidebar;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}> {/* Ensure flex container takes full height */}
      {/* Render the appropriate sidebar */}
      <SidebarComponent />

      {/* Main content area, accounting for the sidebar width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: { xs: 0, sm: '250px' }, // Adjust margin based on screen size, starting from sm
          transition: 'margin-left 0.3s ease',
          width: { xs: '100%', sm: 'calc(100% - 250px)' }, // Calculate width based on screen size, starting from sm
          marginTop: { xs: '56px', sm: '64px' } // Add top margin to account for a fixed TopBar if you have one
        }}
      >
        {/* Render the nested route content */}
        {children}
      </Box>
    </Box>
  );
};

export default UserDashboardLayout; 