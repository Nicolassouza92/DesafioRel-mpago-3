import React from 'react';
import RegisterForm from '../components/auth/RegisterForm'; // Assumindo que RegisterForm.tsx está em components/auth/
import { Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <>
      <RegisterForm />
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Já tem uma conta?{' '}
        <MuiLink component={RouterLink} to="/login" variant="body2">
          Faça login
        </MuiLink>
      </Typography>
    </>
  );
};

export default RegisterPage;