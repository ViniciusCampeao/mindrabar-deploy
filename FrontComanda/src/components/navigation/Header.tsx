import { useState } from "react";
import Logo from "../ui/Logo";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  Avatar,
  Fade,
  Tooltip,
  Divider,
  Container,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Restaurant as RestaurantIcon,
  TableRestaurant as TableRestaurantIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  AttachMoney as MoneyIcon,
  ViewList as QueueIcon,
  Close as CloseIcon,
  PeopleAlt as PeopleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import { useThemeMode } from "../../contexts/useThemeMode";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null as HTMLElement | null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        text: "Mesas",
        icon: <TableRestaurantIcon />,
        onClick: () => navigate("/tables"),
      },
    ];

    const MANAGERItems = [
      {
        text: "Dashboard",
        icon: <RestaurantIcon />,
        onClick: () => navigate("/dashboard"),
      },
      {
        text: "Fila de Pedidos",
        icon: <QueueIcon />,
        onClick: () => navigate("/queue"),
      },
      {
        text: "Relatório de Vendas",
        icon: <MoneyIcon />,
        onClick: () => navigate("/sales"),
      },
      {
        text: "Gerenciar Usuários",
        icon: <PeopleIcon />,
        onClick: () => navigate("/user-management"),
      },
      {
        text: "Novo Usuário",
        icon: <AccountCircle />,
        onClick: () => navigate("/register"),
      },
    ];

    const waiterItems = [
      /*{
        text: "Minhas Mesas",
        icon: <TableRestaurantIcon />,
        onClick: () => navigate("/waiter-tables"),
      },*/
      {
        text: "Gerenciar Pedidos",
        icon: <ReceiptIcon />,
        onClick: () => navigate("/waiter-orders"),
      },
      {
        text: "Cardápio",
        icon: <RestaurantIcon />,
        onClick: () => navigate("/menu"),
      },
    ];

    return user?.role === "MANAGER"
      ? [...commonItems, ...MANAGERItems]
      : [...commonItems, ...waiterItems];
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Logo sx={{ mr: 0.5 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontSize: "1.1rem",
              color: theme.palette.primary.main,
              letterSpacing: "-0.5px",
            }}
          >
            Comanda
          </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ 
            display: { xs: "flex", sm: "none" },
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      
      <Box sx={{ py: 2, flexGrow: 1, overflow: 'auto' }}>
        {user && (
          <Box sx={{ px: 3, mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                mb: 1,
                bgcolor: theme.palette.primary.main,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body1" fontWeight={600}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role === 'MANAGER' ? 'Gerente' : 'Garçom'}
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        <List sx={{ px: 1.5 }}>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  item.onClick();
                  setMobileOpen(false);
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: theme.shape.borderRadius,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    transform: "translateX(5px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            fullWidth
            startIcon={mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            onClick={toggleTheme}
            sx={{
              py: 1,
              color: theme.palette.text.primary,
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${theme.palette.divider}`,
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </Button>
        </Box>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            py: 1,
            color: theme.palette.error.main,
            justifyContent: "flex-start",
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.dark,
            },
          }}
        >
          Sair
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary, 
          display: mobileOpen ? { xs: "none", sm: "block" } : "block",
        }}
      >
        <Container maxWidth={false}>
          <Toolbar sx={{ px: { xs: 1, sm: 2 }, height: 56, minHeight: 56 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
              }}
            >
              <Logo sx={{ mr: 0.5 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                  letterSpacing: "-0.5px",
                }}
              >
                Comanda
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 0.5 }}>
              {menuItems.map(item => (
                <Button
                  key={item.text}
                  onClick={item.onClick}
                  startIcon={item.icon}
                  sx={{
                    py: 1,
                    px: 2,
                    color: theme.palette.text.primary,
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    borderRadius: theme.shape.borderRadius,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '50%',
                  p: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'rotate(180deg)',
                  }
                }}
              >
                {mode === 'light' ? (
                  <DarkModeIcon sx={{ fontSize: 20 }} />
                ) : (
                  <LightModeIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações da conta">
              <IconButton
                size="medium"
                aria-label="configurações da conta"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '50%',
                  p: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
              PaperProps={{
                elevation: 2,
                sx: {
                  borderRadius: 0,
                  minWidth: 200,
                  overflow: 'visible',
                  mt: 1.5,
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={handleSignOut}
                sx={{
                  py: 1.5,
                  fontSize: '0.875rem',
                  margin: 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.dark,
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        </Container>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            elevation: 0,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "100%", 
              height: "100%",
              borderRight: "none",
              backgroundColor: theme.palette.background.paper,
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(2px)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main">
        <Toolbar />
      </Box>
    </>
  );
}