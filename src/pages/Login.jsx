import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Fade,
  Grow,
} from "@mui/material";
import {
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";

const Login = () => {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { error, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.isAdmin ? "/admin" : "/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      dispatch(login(credentials));
      setIsLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const quickLogin = (id, password) => {
    setCredentials({ id, password });
    dispatch(login({ id, password }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Trial users data
  const trialUsers = [
    { name: "Alice", id: "u1", password: "alice123", role: "User", color: "primary" },
    { name: "Bob", id: "u2", password: "bob123", role: "User", color: "primary" },
    { name: "Administrator", id: "admin", password: "admin123", role: "Admin", color: "success" },
  ];

  if (currentUser) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 3 }}>
        <Grow in timeout={800}>
          <Card
            elevation={8}
            sx={{
              width: "100%",
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {currentUser.isAdmin ? <AdminIcon sx={{ fontSize: 40 }} /> : <PersonIcon sx={{ fontSize: 40 }} />}
              </Avatar>

              <Typography variant="h4" gutterBottom fontWeight="bold">
                Welcome, {currentUser.name}!
              </Typography>

              <Chip
                label={currentUser.isAdmin ? "Administrator" : "User"}
                color={currentUser.isAdmin ? "warning" : "info"}
                sx={{ mb: 4, fontWeight: "bold" }}
              />

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate(currentUser.isAdmin ? "/admin" : "/dashboard")}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                    borderRadius: 2,
                    py: 1.5,
                  }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={() => dispatch(logout())}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.8)",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                    borderRadius: 2,
                    py: 1.5,
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grow>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        py: 3,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={1000}>
          <Card
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                minHeight: { md: "600px" },
              }}
            >
              {/* Left Panel - Login Form */}
              <Box sx={{ flex: 1, p: { xs: 3, sm: 4, md: 5 } }}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "primary.main",
                    }}
                  >
                    <LockIcon sx={{ fontSize: 32 }} />
                  </Avatar>

                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    MoneyTransfer
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    Secure Money Transfer Platform
                  </Typography>
                </Box>

                {error && (
                  <Fade in>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<LockIcon />}>
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="User ID"
                      name="id"
                      value={credentials.id}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AccountCircleIcon sx={{ color: "action.active", mr: 1 }} />,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LockIcon sx={{ color: "action.active", mr: 1 }} />,
                        endAdornment: (
                          <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                        },
                      }}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </Stack>
                </Box>
              </Box>

              {/* Right Panel - Trial Credentials */}
              <Box
                sx={{
                  flex: { md: 0.8 },
                  bgcolor: "grey.50",
                  p: { xs: 3, sm: 4, md: 5 },
                  borderLeft: { md: "1px solid" },
                  borderTop: { xs: "1px solid", md: "none" },
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Trial User Credentials
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click on any credential to quick login
                </Typography>

                <Stack spacing={2}>
                  {trialUsers.map((user, index) => (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          elevation: 4,
                          transform: "translateY(-2px)",
                          bgcolor: "primary.50",
                        },
                      }}
                      onClick={() => quickLogin(user.id, user.password)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 2,
                            bgcolor: user.role === "Admin" ? "success.main" : "primary.main",
                          }}
                        >
                          {user.role === "Admin" ? <AdminIcon /> : <PersonIcon />}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === "Admin" ? "success" : "primary"}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ pl: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          ID:{" "}
                          <Box component="span" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                            {user.id}
                          </Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Password:{" "}
                          <Box component="span" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                            {user.password}
                          </Box>
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
