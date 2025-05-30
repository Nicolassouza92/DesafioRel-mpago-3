import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, CssBaseline } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        
        <Outlet />
      </Box>
    </Container>
  );
};

export default AuthLayout;