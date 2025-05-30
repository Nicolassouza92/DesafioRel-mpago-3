import React from 'react';
import LoginForm from '../components/auth/LoginForm'; 
import { Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <>
      
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