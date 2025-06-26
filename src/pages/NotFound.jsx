import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Stack,
  Avatar,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  SentimentVeryDissatisfied as SadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";

// Custom animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const wiggle = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

const NotFound = ({
  title = "404",
  message = "Oops! The page you're looking for doesn't exist.",
  showHomeButton = true,
  showBackButton = true,
  animated = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={1000}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
              p: { xs: 4, sm: 6, md: 8 },
            }}
          >
            {/* Floating 404 Animation */}
            <Grow in timeout={1200}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "6rem", sm: "8rem", md: "10rem" },
                    fontWeight: "bold",
                    background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: animated ? `${float} 3s ease-in-out infinite` : "none",
                    textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {title}
                </Typography>
              </Box>
            </Grow>

            {/* Sad Face Icon */}
            <Fade in timeout={1500}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  mx: "auto",
                  mb: 4,
                  bgcolor: "rgba(102, 126, 234, 0.1)",
                  animation: animated ? `${wiggle} 2s ease-in-out infinite 3s` : "none",
                }}
              >
                <SadIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: "#667eea" }} />
              </Avatar>
            </Fade>

            {/* Error Message */}
            <Fade in timeout={1800}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "text.primary",
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                Page Not Found
              </Typography>
            </Fade>

            <Fade in timeout={2000}>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 6,
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {message}
              </Typography>
            </Fade>

            {/* Action Buttons */}
            <Fade in timeout={2200}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                {showHomeButton && (
                  <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                      boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
                      animation: animated ? `${bounce} 2s ease-in-out infinite 4s` : "none",
                      "&:hover": {
                        background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Go to Home
                  </Button>
                )}

                {showBackButton && (
                  <Button
                    onClick={handleGoBack}
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5a67d8",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Go Back
                  </Button>
                )}

                <IconButton
                  onClick={handleRefresh}
                  size="large"
                  sx={{
                    color: "#667eea",
                    border: "2px solid #667eea",
                    "&:hover": {
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      transform: "rotate(180deg)",
                    },
                    transition: "all 0.5s ease",
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Fade>

            {/* Additional Help Text */}
            <Fade in timeout={2500}>
              <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Need help? Here are some suggestions:
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                  <Button variant="text" size="small" startIcon={<SearchIcon />} sx={{ color: "text.secondary" }}>
                    Search
                  </Button>
                  <Button variant="text" size="small" component={Link} to="/contact" sx={{ color: "text.secondary" }}>
                    Contact Support
                  </Button>
                  <Button variant="text" size="small" component={Link} to="/help" sx={{ color: "text.secondary" }}>
                    Help Center
                  </Button>
                </Stack>
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

// Alternative minimal version
export const NotFoundMinimal = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4rem", sm: "6rem" },
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography variant="h5" sx={{ mb: 4, color: "text.secondary" }}>
            Page not found
          </Typography>

          <Button component={Link} to="/" variant="contained" size="large" startIcon={<HomeIcon />}>
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export const NotFoundWithSearch = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <NotFound
      message="The page you're looking for might have been moved or doesn't exist. Try searching for what you need."
      showHomeButton={true}
      showBackButton={true}
    />
  );
};

export default NotFound;
