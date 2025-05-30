import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(nome, email, senha);
      // Idealmente, o backend já logaria o usuário e o register no AuthContext lidaria com isso.
      // Se não, poderíamos chamar login() aqui ou o backend retornar os dados para popular o user.
      // Pela nossa configuração anterior do backend (login retorna o usuário),
      // e o AuthContext.register também pode popular o usuário.
      navigate("/"); // Redireciona para o dashboard após registro
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Falha ao registrar. Tente novamente.");
      }
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        margin: "auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Registrar
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Nome Completo"
        type="text"
        variant="outlined"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        disabled={loading}
      />
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <TextField
        label="Senha"
        type="password"
        variant="outlined"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        disabled={loading}
        helperText="Mínimo de 8 caracteres"
      />
      <TextField
        label="Confirmar Senha"
        type="password"
        variant="outlined"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        required
        disabled={loading}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Registrar"}
      </Button>
    </Box>
  );
};

export default RegisterForm;
