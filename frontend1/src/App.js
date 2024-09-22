import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutAccount from "./components/Dashboard";
import { Container, Button, Typography, CircularProgress } from "@mui/material";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAuthenticated = params.get("authenticated") === "true";

    if (isAuthenticated) {
      checkLoginStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      checkLoginStatus();
    }
  }, []);

  const checkLoginStatus = async () => {
    if (isLoggedIn) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/calendar`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching login status:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth`;
  };

  return (
    <Container style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        My Calendar App
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : !isLoggedIn ? (
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Log In with Google
        </Button>
      ) : (
        <>
          <Typography variant="h5">Hello World</Typography>
          <DashboardLayoutAccount />
        </>
      )}
    </Container>
  );
};

export default App;
