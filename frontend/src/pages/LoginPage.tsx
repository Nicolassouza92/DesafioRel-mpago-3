import React from 'react';
import LoginForm from '../components/auth/LoginForm'; // Assumindo que LoginForm.tsx está em components/auth/
import { Typography, Link as MuiLink } from '@mui/material'; // Box e Container já estão no AuthLayout
import { Link as RouterLink } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <>
      {/* AuthLayout já fornece o Container e Box de centralização */}
      <LoginForm />
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Não tem uma conta?{' '}
        <MuiLink component={RouterLink} to="/registrar" variant="body2">
          Registre-se aqui
        </MuiLink>
      </Typography>
    </>
  );
};

export default LoginPage;