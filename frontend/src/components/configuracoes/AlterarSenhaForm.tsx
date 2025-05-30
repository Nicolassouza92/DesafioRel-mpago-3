import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert as MuiAlert,
  Typography,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import * as userService from "../../api/userService";
import type { IUserUpdate } from "../../../../backend/src/interfaces/user.interface";

const AlterarSenhaForm: React.FC = () => {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setError("Todos os campos de senha são obrigatórios.");
      return;
    }
    if (novaSenha.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (!user) {
      setError("Usuário não autenticado. Não é possível alterar a senha.");
      return;
    }

    setLoading(true);

   
    const dadosUpdate: IUserUpdate = {
      senhaAtual: senhaAtual, 
      novaSenha: novaSenha,
    };

    try {
      
      await userService.atualizarUsuario(user.id, dadosUpdate);
      setSuccess("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar senha.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
      )}
      {success && (
        <MuiAlert severity="success" sx={{ mb: 2 }}>
          {success}
        </MuiAlert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Para alterar sua senha, preencha os campos abaixo. (Nota: A validação da
        "Senha Atual" não está implementada no backend neste exemplo).
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        name="senhaAtual"
        label="Senha Atual"
        type="password"
        id="senhaAtual"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        disabled={loading}
        sx={{ mb: 1 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="novaSenha"
        label="Nova Senha"
        type="password"
        id="novaSenha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        helperText="Mínimo de 8 caracteres"
        disabled={loading}
        sx={{ mb: 1 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmarNovaSenha"
        label="Confirmar Nova Senha"
        type="password"
        id="confirmarNovaSenha"
        value={confirmarNovaSenha}
        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading || !senhaAtual || !novaSenha || !confirmarNovaSenha}
        sx={{ mt: 1 }}
      >
        {loading ? <CircularProgress size={24} /> : "Alterar Senha"}
      </Button>
    </Box>
  );
};

export default AlterarSenhaForm;
