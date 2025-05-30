import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import PerfilUsuarioForm from '../components/configuracoes/PerfilUsuarioForm';
import AlterarSenhaForm from '../components/configuracoes/AlterarSenhaForm';
import { useAuth } from '../contexts/AuthContext';

const ConfiguracoesPage: React.FC = () => {
  const { user } = useAuth(); // Para pegar os dados do usuário atual

  if (!user) {
    return <Typography>Carregando dados do usuário...</Typography>; // Ou um spinner
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações da Conta
      </Typography>

      <Paper elevation={3} sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Meus Dados
        </Typography>
        <PerfilUsuarioForm usuarioAtual={user} />
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Alterar Senha
        </Typography>
        <AlterarSenhaForm />
      </Paper>
    </Box>
  );
};

export default ConfiguracoesPage;