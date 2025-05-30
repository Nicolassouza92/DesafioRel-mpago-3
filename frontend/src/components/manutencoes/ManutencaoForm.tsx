import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box,  
  CircularProgress, 
  Alert, 
} from '@mui/material';
import type { IManutencaoFormData } from '../../api/manutencaoService';
import type { IManutencaoResponse } from '../../../../backend/src/interfaces/manutencao.interface';

interface ManutencaoFormProps {
  ativoId: number;
  onSave: (manutencaoData: IManutencaoFormData, idManutencao?: number) => Promise<void>;
  onCancel: () => void;
  initialData?: IManutencaoResponse | null;
  isLoading?: boolean;
  initialDescricaoServico?: string;
}

const ManutencaoForm: React.FC<ManutencaoFormProps> = ({
  ativoId,
  onSave,
  onCancel,
  initialData,
  isLoading,
  initialDescricaoServico,
}) => {
  const [descricaoServico, setDescricaoServico] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');
  const [dataExecucao, setDataExecucao] = useState('');
  const [proximaData, setProximaData] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setDescricaoServico(initialData.descricaoServico || '');
      setDescricaoDetalhada(initialData.descricaoDetalhada || '');
      setDataExecucao(initialData.dataExecucao || new Date().toISOString().split('T')[0]);
      setProximaData(initialData.proximaData || '');
    } else {
      setDescricaoServico(initialDescricaoServico || '');
      setDescricaoDetalhada('');
      setDataExecucao(new Date().toISOString().split('T')[0]);
      setProximaData('');
    }
  }, [initialData, initialDescricaoServico]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!descricaoServico.trim()) {
      setFormError('A descrição do serviço é obrigatória.');
      return;
    }
    if (!dataExecucao) {
      setFormError('A data de execução é obrigatória.');
      return;
    }
    if (proximaData && dataExecucao && new Date(proximaData) < new Date(dataExecucao)) {
      setFormError('A próxima data de manutenção não pode ser anterior à data de execução.');
      return;
    }

    const manutencaoDataPayload: IManutencaoFormData = {
      ativoId,
      descricaoServico,
      descricaoDetalhada,
      dataExecucao,
      proximaData: proximaData || undefined,
    };
    
    try {
      await onSave(manutencaoDataPayload, initialData?.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormError(error.message || 'Ocorreu um erro ao salvar a manutenção.');
      } else {
        setFormError('Um erro desconhecido ocorreu ao salvar a manutenção.');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="descricaoServico"
        label="Descrição do Serviço"
        name="descricaoServico"
        autoFocus={!initialData}
        value={descricaoServico}
        onChange={(e) => setDescricaoServico(e.target.value)}
        disabled={isLoading}
        InputLabelProps={{ shrink: true }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="dataExecucao"
        label="Data da Execução"
        name="dataExecucao"
        type="date"
        value={dataExecucao}
        onChange={(e) => setDataExecucao(e.target.value)}
        InputLabelProps={{ shrink: true }}
        disabled={isLoading}
      />

      <TextField
        margin="normal"
        fullWidth
        id="proximaData"
        label="Próxima Data de Manutenção (Opcional)"
        name="proximaData"
        type="date"
        value={proximaData}
        onChange={(e) => setProximaData(e.target.value)}
        InputLabelProps={{ shrink: true }}
        disabled={isLoading}
        error={!!(proximaData && dataExecucao && new Date(proximaData) < new Date(dataExecucao))}
        helperText={
          proximaData && dataExecucao && new Date(proximaData) < new Date(dataExecucao)
            ? "Próxima data não pode ser anterior à execução."
            : ""
        }
      />
       <TextField
        margin="normal"
        fullWidth
        id="descricaoDetalhada"
        label="Descrição Detalhada (Opcional)"
        name="descricaoDetalhada"
        multiline
        rows={4}
        value={descricaoDetalhada}
        onChange={(e) => setDescricaoDetalhada(e.target.value)}
        disabled={isLoading}
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={isLoading} color="inherit" variant="outlined">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading} color="primary">
          {isLoading ? <CircularProgress size={24} /> : (initialData ? 'Salvar Alterações' : 'Registrar Manutenção')}
        </Button>
      </Box>
    </Box>
  );
};

export default ManutencaoForm;