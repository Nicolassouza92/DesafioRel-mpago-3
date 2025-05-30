import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, CssBaseline } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline /> {/* Garante estilos base consistentes */}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* As páginas de Login ou Registro serão renderizadas aqui */}
        <Outlet />
      </Box>
    </Container>
  );
};

export default AuthLayout;