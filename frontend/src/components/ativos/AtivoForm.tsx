import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import type { IAtivoFormData } from '../../api/ativoService'; // Importando a interface do service
import type { IAtivoResponse } from '../../../../backend/src/interfaces/ativo.interface'; // Ajuste o caminho

interface AtivoFormProps {
  onSave: (ativoData: IAtivoFormData, id?: number) => Promise<void>; // Pode receber ID para edição
  onCancel: () => void;
  initialData?: IAtivoResponse | null; // Para preencher o formulário na edição
  isLoading?: boolean;
}

const AtivoForm: React.FC<AtivoFormProps> = ({ onSave, onCancel, initialData, isLoading }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setDescricao(initialData.descricao || '');
    } else {
      // Reset para criação
      setNome('');
      setDescricao('');
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setFormError(null);

  if (!nome.trim()) {
    setFormError('O nome do ativo é obrigatório.');
    return;
  }

  const ativoData: IAtivoFormData = { nome, descricao };
  
  try {
    await onSave(ativoData, initialData?.id); // Passa o ID se for edição
  } catch (error: unknown) {
    if (error instanceof Error) {
      setFormError(error.message || 'Ocorreu um erro ao salvar o ativo.');
    } else {
      setFormError('Ocorreu um erro ao salvar o ativo.');
    }
  }
};

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Ativo' : 'Adicionar Novo Ativo'}
      </Typography>
      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="nome"
        label="Nome do Ativo"
        name="nome"
        autoFocus
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        fullWidth
        id="descricao"
        label="Descrição (Opcional)"
        name="descricao"
        multiline
        rows={3}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        disabled={isLoading}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={isLoading} color="inherit">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : (initialData ? 'Salvar Alterações' : 'Adicionar Ativo')}
        </Button>
      </Box>
    </Box>
  );
};

export default AtivoForm;