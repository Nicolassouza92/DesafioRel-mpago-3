import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box,  
  CircularProgress, 
  Alert, // Para agrupar label e input de data // Para label de data
} from '@mui/material';
import type { IManutencaoFormData } from '../../api/manutencaoService'; // Ajuste o caminho se necessário
import type { IManutencaoResponse } from '../../../../backend/src/interfaces/manutencao.interface'; // Ajuste o caminho

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
    if (initialData) { // Modo Edição
      setDescricaoServico(initialData.descricaoServico || '');
      setDescricaoDetalhada(initialData.descricaoDetalhada || '');
      // Assegura que a data vinda do backend (YYYY-MM-DD string) seja usada diretamente
      setDataExecucao(initialData.dataExecucao || new Date().toISOString().split('T')[0]);
      setProximaData(initialData.proximaData || '');
    } else { // Modo Criação
      setDescricaoServico(initialDescricaoServico || '');
      setDescricaoDetalhada('');
      setDataExecucao(new Date().toISOString().split('T')[0]); // Padrão para hoje
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
    // Validação opcional para proximaData, se preenchida, não ser anterior à dataExecucao
    if (proximaData && dataExecucao && new Date(proximaData) < new Date(dataExecucao)) {
      setFormError('A próxima data de manutenção não pode ser anterior à data de execução.');
      return;
    }

    const manutencaoDataPayload: IManutencaoFormData = {
      ativoId, // Já é uma prop, não precisa vir de initialData para criação
      descricaoServico,
      descricaoDetalhada,
      dataExecucao,
      proximaData: proximaData || undefined, // Enviar undefined se vazio para o backend tratar como NULL
    };
    
    try {
      await onSave(manutencaoDataPayload, initialData?.id); // Passa o ID da manutenção se for edição
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
      {/* Título do formulário é gerenciado pelo componente pai (Modal) */}
      {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="descricaoServico"
        label="Descrição do Serviço"
        name="descricaoServico"
        autoFocus={!initialData} // Autofocus apenas na criação ou se não houver descrição pré-preenchida
        value={descricaoServico}
        onChange={(e) => setDescricaoServico(e.target.value)}
        disabled={isLoading}
        InputLabelProps={{ shrink: true }} // Mantém o label "encolhido" se houver valor inicial
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
        // Adicionar validação visual se proximaData for anterior a dataExecucao pode ser feito com sx
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
        rows={4} // Aumentei um pouco
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