import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Alert as MuiAlert } from '@mui/material'; // Renomeado Alert para MuiAlert
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../api/userService'; // Precisaremos de um userService
import type { IUserResponse, IUserUpdate } from '../../../../backend/src/interfaces/user.interface'; // Ajuste o caminho

interface PerfilUsuarioFormProps {
  usuarioAtual: IUserResponse; // Recebe os dados atuais do usuário
}

const PerfilUsuarioForm: React.FC<PerfilUsuarioFormProps> = ({ usuarioAtual }) => {
  const [nome, setNome] = useState(usuarioAtual.nome);
  const [email, setEmail] = useState(usuarioAtual.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { checkAuthStatus } = useAuth(); // Para atualizar o nome na sidebar, se necessário

  // Atualiza o formulário se o usuário no contexto mudar (embora improvável aqui)
  useEffect(() => {
    setNome(usuarioAtual.nome);
    setEmail(usuarioAtual.email);
  }, [usuarioAtual]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!nome.trim() || !email.trim()) {
      setError("Nome e Email são obrigatórios.");
      setLoading(false);
      return;
    }

    const dadosUpdate: IUserUpdate = {};
    if (nome !== usuarioAtual.nome) dadosUpdate.nome = nome;
    if (email !== usuarioAtual.email) dadosUpdate.email = email;

    if (Object.keys(dadosUpdate).length === 0) {
      setSuccess("Nenhuma alteração para salvar.");
      setLoading(false);
      return;
    }

    try {
      await userService.atualizarUsuario(usuarioAtual.id, dadosUpdate);
      setSuccess('Dados atualizados com sucesso!');
      // Se o nome ou email (que podem estar no token/sidebar) mudarem,
      // precisamos informar o AuthContext para buscar o perfil atualizado.
      await checkAuthStatus(); 
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar dados.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
      {success && <MuiAlert severity="success" sx={{ mb: 2 }}>{success}</MuiAlert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="nomePerfil"
        label="Nome Completo"
        name="nomePerfil"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="emailPerfil"
        label="Email"
        name="emailPerfil"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading || (nome === usuarioAtual.nome && email === usuarioAtual.email)}
        sx={{ mt: 1 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
      </Button>
    </Box>
  );
};

export default PerfilUsuarioForm;