import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Heart,
  Star,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  Bell,
  ChevronRight,
  Sun,
  Moon,
  Mail,
} from "lucide-react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Menu as MuiMenu,
  MenuItem,
  Divider,
  IconButton,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";

// Constants
const GRADIENT = "linear-gradient(45deg, #FFD700, #FF8C00)";
const TRANSITION = "all 0.3s ease";
const SHADOW = "0 4px 12px rgba(0,0,0,0.08)";

// Styled Components
const SidebarWrapper = styled(Box)(({ theme, open }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: 300,
  backgroundColor: theme.palette.background.default,
  boxShadow: SHADOW,
  transform: open ? "translateX(0)" : "translateX(-100%)",
  transition: TRANSITION,
  zIndex: 1300,
  [theme.breakpoints.up("lg")]: {
    transform: "translateX(0)",
  },
}));

const Logo = styled(Link)({
  textDecoration: "none",
  display: "block",
  marginBottom: 16,
});

const LogoText = styled(Typography)({
  fontWeight: 900,
  background: GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontSize: "1.8rem",
  letterSpacing: "3px",
  fontFamily: "Montserrat, sans-serif",
});

const ProfileBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px",
  boxShadow: SHADOW,
  cursor: "pointer",
}));

const SidebarItem = styled(Link)(({ theme, active }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  textDecoration: "none",
  borderRadius: 12,
  marginBottom: 8,
  color: active ? "#FF8C00" : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  backgroundColor: active ? "#FFF5E0" : "transparent",
  boxShadow: active ? SHADOW : "none",
  transition: TRANSITION,
  "&:hover": {
    backgroundColor: "#FFF8E7",
    color: "#FF8C00",
  },
}));

const ToggleButton = styled(IconButton)({
  position: "fixed",
  top: 16,
  right: 16,
  zIndex: 1400,
  background: GRADIENT,
  color: "#fff",
  boxShadow: SHADOW,
  "@media (min-width: 1024px)": {
    display: "none",
  },
});

const ActionIcon = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: 12,
  padding: theme.spacing(1),
  transition: TRANSITION,
  "&:hover svg": {
    color: "#FF8C00",
  },
}));

// Main Component
export default function ArtisanSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user")) || {
    name: "Guest User",
    email: "guest@example.com",
    profilePicture: "/default.png",
    role: "guest",
  };

  // Mock unread messages count (replace with real API call if available)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(2); // Example: 2 unread

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, location]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/artisan-dashboard" },
    { icon: Package, label: "Products", path: "/my-products" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Star, label: "Reviews", path: "/reviews" },
    { icon: ShoppingBag, label: "Orders", path: "/orders" },
    { icon: Mail, label: "Messages", path: "/messages" },
  ].filter((item) => !(user.role === "user" && item.label === "Products"));

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  const renderNavItems = () =>
    navItems.map(({ icon: Icon, label, path, badge }) => {
      const isActive = location.pathname === path;
      return (
        <SidebarItem key={path} to={path} active={isActive ? 1 : 0}>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon size={20} />
            <Typography>{label}</Typography>
          </Box>
          {isActive && <ChevronRight size={16} />}
        </SidebarItem>
      );
    });

  return (
    <>
      <ToggleButton onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X /> : <Menu />}
      </ToggleButton>

      <SidebarWrapper open={sidebarOpen}>
        <Box p={3}>
          <Logo to="/">
            <LogoText variant="h5">MAROCRAFT</LogoText>
          </Logo>

          <ProfileBox
            onClick={() => navigate('/profile')}
            sx={{
              background: 'linear-gradient(135deg, #fffbe6 0%, #fff 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f5e9c6',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(255, 140, 0, 0.10)',
                cursor: 'pointer',
              },
            }}
          >
            <Box position="relative" mr={1.5}>
              <Avatar
                src={user.profilePicture}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2.5px solid #FFD700',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.10)',
                }}
              />
              {/* Online status dot */}
              <Box
                position="absolute"
                bottom={2}
                right={2}
                width={12}
                height={12}
                bgcolor="#4CAF50"
                borderRadius="50%"
                border="2px solid #fff"
                boxShadow="0 0 0 2px #FFD700"
              />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={700} fontSize={16} noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#222' }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 13 }}>
                {user.email}
              </Typography>
            </Box>
            <ChevronRight size={18} color="#FF8C00" />
          </ProfileBox>

          <Box mt={2} display="flex" width="100%" justifyContent="space-between">
            <Tooltip title="Notifications">
              <ActionIcon onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Bell size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip title="Settings">
              <ActionIcon onClick={() => navigate('/profile')}>
                <Settings size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <ActionIcon onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </ActionIcon>
            </Tooltip>
          </Box>

          <Box mt={3}>{renderNavItems()}</Box>
        </Box>

        <Box px={2} pb={0}>
          <Button
            fullWidth
            startIcon={<LogOut />}
            onClick={handleLogout}
            sx={{
              justifyContent: "flex-start",
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "error.light",
                color: "error.main",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </SidebarWrapper>

      {/* Profile Menu */}
      <MuiMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        <MenuItem onClick={() => setProfileAnchor(null)}>
          <User size={18} style={{ marginRight: 8 }} /> View Profile
        </MenuItem>
        <MenuItem onClick={() => setProfileAnchor(null)}>
          <Settings size={18} style={{ marginRight: 8 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            handleLogout();
          }}
          sx={{ color: "error.main" }}
        >
          <LogOut size={18} style={{ marginRight: 8 }} /> Logout
        </MenuItem>
      </MuiMenu>

      {/* Notification Menu */}
      <MuiMenu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 300, maxHeight: 400 } }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => setNotifAnchor(null)} sx={{ justifyContent: "center" }}>
          View All Notifications
        </MenuItem>
      </MuiMenu>
    </>
  );
}