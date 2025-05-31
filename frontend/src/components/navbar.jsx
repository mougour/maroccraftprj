import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  InputBase, 
  Box, 
  Container, 
  IconButton, 
  Badge, 
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
  Slide,
  Button,
} from '@mui/material';
import { 
  ShoppingCart, 
  Heart, 
  Search, 
  Menu as MenuIcon,
  LogOut,
  Settings,
  User,
  Package,
  LogIn,
  UserPlus,
  X,
  ChevronRight,
  Bell,
  Star,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserAuth } from '../UserAuthContext';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsMenu, setNotificationsMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  const [countCart, setCountCart] = useState(0);
  const [countFavorites, setCountFavorites] = useState(0);
  const [notifications, setNotifications] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const isActiveRoute = (path) => location.pathname === path;

  const handleProfileClick = (event) => {
    setProfileMenu(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileMenu(null);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsMenu(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsMenu(null);
  };

  const fetchCountCart = async () => {
    try {
      if (user && user._id) {
        const response = await axios.get(`http://localhost:5000/api/cart/count/${user._id}`);
        setCountCart(response.data);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchCountFavorites = async () => {
    try {
      if (user && user._id) {
        const response = await axios.get(`http://localhost:5000/api/favorites/user/${user._id}/count`);
        if (response.data && response.data.success) {
          setCountFavorites(response.data.count);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites count:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchCountCart();
      fetchCountFavorites();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      setLoadingNotifications(true);
      axios.get(`http://localhost:5000/api/users/notifications/${user._id}`)
        .then(res => setNotifications(res.data))
        .catch(() => setNotifications(null))
        .finally(() => setLoadingNotifications(false));
    } else {
      setNotifications(null);
    }
  }, [isAuthenticated, user]);

  // Add event listeners for cart and favorites updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCountCart();
    };

    const handleFavoritesUpdate = () => {
      fetchCountFavorites();
    };

    // Listen for custom events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    // Cleanup listeners
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    handleProfileClose();
    // Perform additional logout logic if needed.
  };

  // Search handling. Navigates to /search with the search query.
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false); // Close mobile search drawer
      setSearchQuery(''); // Clear search query after navigation
    }
  };

  const navItems = [
    { path: '/shop', label: 'Shop' },
    { path: '/collections', label: 'Collections' },
    { path: user?.role === 'customer' ? '/artisans' : '/about', label: user?.role === 'customer' ? 'Artisans' : 'About' },
  ];

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          sx={{ 
            backgroundColor: 'white',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Container maxWidth="xl">
            <Toolbar 
              sx={{ 
                minHeight: { xs: '56px', sm: '64px' }, 
                px: { xs: 1, sm: 2, md: 4 }, 
                gap: { xs: 1, sm: 2 }
              }}
            >
              {/* Mobile Menu Button */}
              <IconButton
                sx={{ 
                  display: { md: 'none' },
                  mr: 0.5
                }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MenuIcon size={22} />
              </IconButton>

              {/* Logo */}
              <Link to="/" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                flexShrink: 0
              }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    background: 'linear-gradient(45deg, #FFD700, #FF8C00)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '2px',
                    fontFamily: '"Montserrat", sans-serif',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  MAROCRAFT
                </Typography>
              </Link>

              {/* Search Bar - Desktop */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '8px 16px',
                flex: '1 1 auto',
                maxWidth: '600px',
                transition: 'all 0.2s ease-in-out',
                '&:focus-within': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 2px #FFD700'
                }
              }}>
                <Search size={18} color="#666" />
                <InputBase
                  placeholder="Search artisans and products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  sx={{ 
                    ml: 1,
                    flex: 1,
                    '& input': {
                      padding: '4px 0',
                      fontSize: '0.95rem',
                      '&::placeholder': {
                        color: '#666',
                        opacity: 1
                      }
                    }
                  }}
                />
                <IconButton onClick={handleSearch}>
                  <Search size={18} color="#666" />
                </IconButton>
              </Box>

              {/* Search Icon - Mobile */}
              <IconButton 
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  ml: 'auto'
                }}
                onClick={() => setSearchOpen(true)}
              >
                <Search size={22} />
              </IconButton>

              {/* Navigation Links - Desktop */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                gap: 0.5,
                ml: 4,
                flexShrink: 0
              }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActiveRoute(item.path) ? '#FFD700' : '#333',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: isActiveRoute(item.path) ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.05)',
                      },
                      textTransform: 'none'
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Icons */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 }, 
                ml: { xs: 0, md: 'auto' },
                flexShrink: 0
              }}>
                <IconButton 
                  component={Link} 
                  to="/favorites"
                  sx={{ 
                    color: isActiveRoute('/favorites') ? '#FFD700' : '#333',
                    padding: { xs: '6px', sm: '8px' },
                  }}
                >
                  <Badge badgeContent={countFavorites} color="error">
                    <Heart size={20} />
                  </Badge>
                </IconButton>
                <IconButton 
                  component={Link} 
                  to="/cart"
                  sx={{ 
                    color: isActiveRoute('/cart') ? '#FFD700' : '#333',
                    padding: { xs: '6px', sm: '8px' },
                  }}
                >
                  <Badge badgeContent={countCart} color="error">
                    <ShoppingCart size={20} />
                  </Badge>
                </IconButton>

                {/* Notifications */}
                {user && (
                  <IconButton 
                    color={isActiveRoute('/notifications') ? 'primary' : 'default'}
                    sx={{ 
                      color: isActiveRoute('/notifications') ? '#FFD700' : '#333',
                      padding: { xs: '6px', sm: '8px' },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.08)',
                        color: '#FFD700',
                      },
                    }}
                    onClick={handleNotificationsClick}
                  >
                    <Badge color="error" badgeContent={
                      notifications ? (
                        user.role === 'artisan' ? (
                          (notifications.unreadMessages || 0) + (notifications.newOrders || 0) + (notifications.newReviews || 0)
                        ) : (
                          (notifications.unreadMessages || 0) + (notifications.orderUpdates || 0) + (notifications.promotions || 0)
                        )
                      ) : 0
                    }>
                      <Bell size={20} />
                    </Badge>
                  </IconButton>
                )}
                
                {/* Profile Menu */}
                <IconButton 
                  sx={{ padding: { xs: '6px', sm: '8px' } }}
                >
                  <Box
                    component="img"
                    src={user?.profilePicture ?? "./default.png"}
                    alt="user image"
                    sx={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={(event) => {
                      if (!user) {
                        setProfileMenu(event.currentTarget);
                        return;
                      }
                      console.log('User role:', user.role);
                      if (user.role === "customer") {
                        navigate("/customer-dash");
                      } else if (user.role === "artisan") {
                        navigate("/artisan-dashboard");
                      } else {
                        navigate("/profile");
                      }
                    }}
                  />
                </IconButton>

                {/* Profile Dropdown Menu */}
                <Menu
                  anchorEl={profileMenu}
                  open={Boolean(profileMenu)}
                  onClose={handleProfileClose}
                  onClick={handleProfileClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                  PaperProps={{
                    elevation: 2,
                    sx: {
                      mt: 5.5,
                      width: 220,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.5,
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" noWrap>
                      Create or access your account
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => navigate('/login')}>
                    <ListItemIcon>
                      <LogIn size={20} />
                    </ListItemIcon>
                    Login
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/register')}>
                    <ListItemIcon>
                      <UserPlus size={20} />
                    </ListItemIcon>
                    Register
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '100%', maxWidth: 360 } }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </IconButton>
          </Box>
          <List sx={{ flex: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton 
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: isActiveRoute(item.path)
                      ? 'rgba(255, 215, 0, 0.1)'
                      : 'transparent',
                  }}
                >
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      style: {
                        color: isActiveRoute(item.path) ? '#FFD700' : '#333',
                        fontWeight: 500,
                      },
                    }}
                  />
                  <ChevronRight size={20} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ width: 40, height: 40, mr: 2, backgroundColor: 'primary.main' }}
              >
                <User size={24} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <p className="text-gray-600">
                  Artisan since {user?.createdAt ? user.createdAt.slice(0, 4) : 'N/A'}
                </p>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              startIcon={<LogOut size={18} />}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Mobile Search Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        sx={{ 
          display: { md: 'none' },
          '& .MuiDrawer-paper': { pt: 8 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '8px 16px',
          }}>
            <Search size={20} color="#666" />
            <InputBase
              autoFocus
              placeholder="Search artisans and products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter'){
                  handleSearch();
                }
              }}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton size="small" onClick={handleSearch}>
              <X size={20} />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Notifications Dropdown */}
      <Menu
        anchorEl={notificationsMenu}
        open={Boolean(notificationsMenu)}
        onClose={handleNotificationsClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 320 } }}
      >
        {loadingNotifications ? (
          <MenuItem disabled>Loading notifications...</MenuItem>
        ) : notifications ? (
          <>
            {user.role === 'artisan' ? (
              <>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/messages'); }}>
                  <ListItemIcon><Bell size={18} /></ListItemIcon>
                  <ListItemText primary={`New Messages (${notifications.unreadMessages || 0})`} />
                </MenuItem>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/orders'); }}>
                  <ListItemIcon><Package size={18} /></ListItemIcon>
                  <ListItemText primary={`New Orders (${notifications.newOrders || 0})`} />
                </MenuItem>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/reviews'); }}>
                  <ListItemIcon><Star size={18} /></ListItemIcon>
                  <ListItemText primary={`New Reviews (${notifications.newReviews || 0})`} />
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/messages'); }}>
                  <ListItemIcon><Bell size={18} /></ListItemIcon>
                  <ListItemText primary={`New Messages (${notifications.unreadMessages || 0})`} />
                </MenuItem>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/orders'); }}>
                  <ListItemIcon><Package size={18} /></ListItemIcon>
                  <ListItemText primary={`Order Updates (${notifications.orderUpdates || 0})`} />
                </MenuItem>
                <MenuItem onClick={() => { handleNotificationsClose(); navigate('/promotions'); }}>
                  <ListItemIcon><Star size={18} /></ListItemIcon>
                  <ListItemText primary={`Promotions (${notifications.promotions || 0})`} />
                </MenuItem>
              </>
            )}
          </>
        ) : (
          <MenuItem disabled>No new notifications.</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Navbar;
