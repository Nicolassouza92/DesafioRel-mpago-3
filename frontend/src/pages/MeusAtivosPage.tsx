import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Modal,
  Paper,
  IconButton,
  Snackbar, // Adicionado para feedback
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import * as ativoService from "../api/ativoService";
import * as manutencaoService from "../api/manutencaoService";
import type { IAtivoFormData } from '../api/ativoService';
import type { IManutencaoFormData } from '../api/manutencaoService';
import type { IAtivoResponse } from "../../../backend/src/interfaces/ativo.interface"; // Ajuste o caminho
import AtivoForm from "../components/ativos/AtivoForm";
import ManutencaoForm from "../components/manutencoes/ManutencaoForm";
import ConfirmacaoDialog from "../components/common/ConfirmacaoDialog"; // Para deleção de ativo


interface AtivoCardProps {
  ativo: IAtivoResponse;
  onEditar: (ativo: IAtivoResponse) => void;
  onDeletar: (ativo: IAtivoResponse) => void;
  onAdicionarManutencao: (ativoId: number, nomeAtivo: string) => void;
}

const AtivoCard: React.FC<AtivoCardProps> = ({
  ativo,
  onEditar,
  onDeletar,
  onAdicionarManutencao,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Typography variant="h6" gutterBottom>{ativo.nome}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 1 }}>
        {ativo.descricao || "Sem descrição"}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary" sx={{mb: 1}}>
        Criado em: {ativo.criadoEm ? new Date(ativo.criadoEm).toLocaleDateString() : 'Data indisponível'}
      </Typography>
      <Box sx={{ mt: 'auto', pt: 1, display: "flex", justifyContent: 'space-between', gap: 1 }}>
        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEditar(ativo)}>
          Editar Ativo
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDeletar(ativo)}
        >
          Deletar Ativo
        </Button>
      </Box>
      <Button
          size="small"
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => onAdicionarManutencao(ativo.id, ativo.nome)}
          fullWidth
          sx={{mt: 1}}
        >
          Registrar Manutenção
        </Button>
    </Paper>
  );
};


const MeusAtivosPage: React.FC = () => {
  const [ativos, setAtivos] = useState<IAtivoResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null); // Erro geral da página
  
  const [isAtivoModalOpen, setIsAtivoModalOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<IAtivoResponse | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ativoParaDeletar, setAtivoParaDeletar] = useState<IAtivoResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false);
  const [currentAtivoIdParaManutencao, setCurrentAtivoIdParaManutencao] = useState<number | null>(null);
  const [currentAtivoNomeParaManutencao, setCurrentAtivoNomeParaManutencao] = useState<string>('');
  // const [editingManutencao, setEditingManutencao] = useState<IManutencaoResponse | null>(null); 

  // Estado para Snackbar de feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');


  const fetchAtivos = async () => { 
    try {
      setLoading(true);
      setPageError(null);
      const data = await ativoService.listarAtivos();
      setAtivos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao buscar ativos.";
      setPageError(msg);
      console.error(msg, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtivos();
  }, []);

  const handleOpenAdicionarAtivoModal = () => {
    setEditingAtivo(null); 
    setIsAtivoModalOpen(true);
  };
  const handleOpenEditarAtivoModal = (ativo: IAtivoResponse) => {
    setEditingAtivo(ativo);
    setIsAtivoModalOpen(true);
  };
  const handleCloseAtivoModal = () => {
    setIsAtivoModalOpen(false);
    setEditingAtivo(null);
  };

  const handleSaveAtivo = async (ativoData: IAtivoFormData, id?: number) => {
    setFormSubmitting(true);
    setPageError(null); 
    try {
      if (id) { 
        const ativoAtualizado = await ativoService.atualizarAtivo(id, ativoData);
        setAtivos(prevAtivos => prevAtivos.map(a => (a.id === id ? ativoAtualizado : a)));
        setSnackbarMessage('Ativo atualizado com sucesso!');
        setSnackbarSeverity('success');
      } else { 
        const novoAtivo = await ativoService.criarAtivo(ativoData);
        setAtivos(prevAtivos => [novoAtivo, ...prevAtivos]); 
        setSnackbarMessage('Ativo adicionado com sucesso!');
        setSnackbarSeverity('success');
      }
      setSnackbarOpen(true);
      handleCloseAtivoModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar ativo:", err);
      const msg = err instanceof Error ? err.message : (id ? "Erro ao atualizar ativo." : "Erro ao criar ativo.");
      // O AtivoForm já mostra o erro, mas podemos também mostrar um Snackbar de erro
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (ativo: IAtivoResponse) => {
    setAtivoParaDeletar(ativo);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setAtivoParaDeletar(null);
    setIsDeleteDialogOpen(false);
  };
  const handleConfirmDeletarAtivo = async () => {
    if (!ativoParaDeletar) return;
    setDeleting(true);
    setPageError(null);
    try {
      await ativoService.deletarAtivo(ativoParaDeletar.id);
      setAtivos((prevAtivos) => prevAtivos.filter((a) => a.id !== ativoParaDeletar.id));
      setSnackbarMessage(`Ativo "${ativoParaDeletar.nome}" deletado com sucesso!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao deletar ativo.";
      setPageError(msg); // Pode mostrar no Alert da página
      setSnackbarMessage(msg); // E/ou no Snackbar
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error(msg, err);
    } finally {
      setDeleting(false);
    }
  };
  
  const handleOpenAdicionarManutencaoModal = (ativoId: number, nomeAtivo: string) => {
    setCurrentAtivoIdParaManutencao(ativoId);
    setCurrentAtivoNomeParaManutencao(nomeAtivo);
    setIsManutencaoModalOpen(true);
  };
  const handleCloseManutencaoModal = () => {
    setIsManutencaoModalOpen(false);
    setCurrentAtivoIdParaManutencao(null);
    setCurrentAtivoNomeParaManutencao('');
  };

  const handleSaveManutencao = async (manutencaoData: IManutencaoFormData, idManutencao?: number) => {
    if (!currentAtivoIdParaManutencao && !idManutencao) {
      const msg = "ID do ativo não encontrado para salvar a manutenção.";
      setPageError(msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setFormSubmitting(true); 
    setPageError(null);
    try {
      if (idManutencao) { 
        console.log("Editando Manutenção (a ser implementado):", manutencaoData);
        setSnackbarMessage('Funcionalidade de editar manutenção a ser implementada.');
        setSnackbarSeverity('info');
      } else if (currentAtivoIdParaManutencao) { 
        const dadosParaCriar = { ...manutencaoData, ativoId: currentAtivoIdParaManutencao };
        await manutencaoService.criarManutencao(dadosParaCriar);
        setSnackbarMessage('Manutenção registrada com sucesso!');
        setSnackbarSeverity('success');
        // Idealmente, o painel de pendências ou o histórico se atualizariam.
        // Se o AtivoCard mostrasse um resumo das manutenções, chamar fetchAtivos() aqui seria útil.
      }
      setSnackbarOpen(true);
      handleCloseManutencaoModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar manutenção:", err);
      const msg = err instanceof Error ? err.message : "Erro ao salvar manutenção.";
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading && ativos.length === 0) { 
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ p:3, height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: {xs: 1, sm: 2, md: 3} }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Meus Ativos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdicionarAtivoModal}>
          Adicionar Ativo
        </Button>
      </Box>

      {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}
      {loading && ativos.length > 0 && <CircularProgress sx={{display: 'block', margin: '20px auto'}}/>}
      {!loading && ativos.length === 0 && !pageError && (
        <Typography sx={{textAlign: 'center', mt: 4}}>
            Você ainda não cadastrou nenhum ativo. Clique em "Adicionar Ativo" para começar!
        </Typography>
      )}

      <Grid container spacing={2} rowSpacing={2}>
        {ativos.map((ativo) => (
          <Grid key={ativo.id} size={{ xs: 12, sm: 6, md: 4 }} sx={{ mb: 3 }}>
            <AtivoCard
              ativo={ativo}
              onEditar={handleOpenEditarAtivoModal}
              onDeletar={handleOpenDeleteDialog} 
              onAdicionarManutencao={handleOpenAdicionarManutencaoModal}
            />
          </Grid>
        ))}
      </Grid>

      {/* Modal para Adicionar/Editar Ativo */}
      <Modal open={isAtivoModalOpen} onClose={handleCloseAtivoModal} aria-labelledby="ativo-form-modal-title">
        <Paper sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 450 }, bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2, sm: 3, md: 4}, borderRadius: 2
        }}>
          <AtivoForm
            onSave={handleSaveAtivo}
            onCancel={handleCloseAtivoModal}
            initialData={editingAtivo}
            isLoading={formSubmitting}
          />
        </Paper>
      </Modal>

      {/* Dialog para Confirmação de Deleção de Ativo */}
      {ativoParaDeletar && (
        <ConfirmacaoDialog
          open={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDeletarAtivo}
          title="Confirmar Exclusão de Ativo"
          contentText={
            <>
              Tem certeza que deseja excluir o ativo 
              <Typography component="span" fontWeight="bold"> "{ativoParaDeletar.nome}"</Typography>? 
              Todas as manutenções associadas também serão excluídas. Esta ação não poderá ser desfeita.
            </>
          }
          confirmButtonText="Excluir"
          isConfirming={deleting}
        />
      )}

      {/* Modal para Adicionar/Editar Manutenção */}
      {currentAtivoIdParaManutencao && (
        <Modal
          open={isManutencaoModalOpen}
          onClose={handleCloseManutencaoModal}
          aria-labelledby="manutencao-form-modal-title"
        >
          <Paper sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2, sm: 3, md: 4}, borderRadius: 2
          }}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" id="manutencao-form-modal-title" component="h2">
                    Registrar Manutenção para: {currentAtivoNomeParaManutencao}
                </Typography>
                <IconButton onClick={handleCloseManutencaoModal} size="small" aria-label="Fechar modal">
                    <CloseIcon />
                </IconButton>
            </Box>
            <ManutencaoForm
              ativoId={currentAtivoIdParaManutencao}
              onSave={handleSaveManutencao}
              onCancel={handleCloseManutencaoModal}
              isLoading={formSubmitting}
              // initialData={editingManutencao} // Para futura edição
            />
          </Paper>
        </Modal>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose} // Assinatura correta agora
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* O Alert dentro do Snackbar permite estilização por severidade */}
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeusAtivosPage;