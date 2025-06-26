import React from "react";
import { Box, CircularProgress, Typography, Fade, Stack, useTheme, useMediaQuery } from "@mui/material";
import { keyframes } from "@mui/system";

// Custom animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const Loader = ({ message = "Loading...", size = 60, variant = "default", showMessage = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const renderLoader = () => {
    switch (variant) {
      case "minimal":
        return (
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: "primary.main",
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        );

      case "gradient":
        return (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              size={size}
              thickness={4}
              sx={{
                color: "transparent",
                "& .MuiCircularProgress-circle": {
                  stroke: "url(#gradient)",
                },
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: "50%",
                  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  animation: `${pulse} 1.5s ease-in-out infinite`,
                }}
              />
            </Box>
          </Box>
        );

      case "dots":
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  animation: `${float} 1.4s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Stack>
        );

      case "spinning-logo":
        return (
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "spin 2s linear infinite",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "80%",
                height: "80%",
                borderRadius: "50%",
                background: "white",
              },
              "&::after": {
                content: '"$"',
                position: "absolute",
                fontSize: size * 0.4,
                fontWeight: "bold",
                color: "primary.main",
                zIndex: 1,
              },
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        );

      default:
        return (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              size={size}
              thickness={4}
              sx={{
                color: "primary.main",
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={size * 0.6}
                thickness={6}
                sx={{
                  color: "secondary.main",
                  opacity: 0.3,
                }}
              />
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        px: 2,
      }}
    >
      <Fade in timeout={500}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
        >
          <Box sx={{ mb: showMessage ? 3 : 0 }}>{renderLoader()}</Box>

          {showMessage && (
            <Fade in timeout={1000}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  color: "white",
                  fontWeight: 500,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                }}
              >
                {message}
              </Typography>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

// Example usage component showing different variants
export const LoaderShowcase = () => {
  const [currentVariant, setCurrentVariant] = React.useState(0);
  const variants = [
    { name: "Default", value: "default" },
    { name: "Minimal", value: "minimal" },
    { name: "Gradient", value: "gradient" },
    { name: "Dots", value: "dots" },
    { name: "Spinning Logo", value: "spinning-logo" },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVariant((prev) => (prev + 1) % variants.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <Loader
        variant={variants[currentVariant].value}
        message={`Loading with ${variants[currentVariant].name} style...`}
        size={80}
      />

      {/* Variant indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          p: 2,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {variants[currentVariant].name} ({currentVariant + 1}/{variants.length})
        </Typography>
      </Box>
    </Box>
  );
};

export default Loader;
