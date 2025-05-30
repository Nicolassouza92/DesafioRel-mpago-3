import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Snackbar,
  Modal,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import * as manutencaoService from "../api/manutencaoService";
import type {
  IManutencaoResponse,
  IManutencaoUpdate,
} from "../../../backend/src/interfaces/manutencao.interface";
import type { IManutencaoFormData } from "../api/manutencaoService";
import type { SnackbarCloseReason } from "@mui/material";
import ConfirmacaoDialog from "../components/common/ConfirmacaoDialog";
import ManutencaoForm from "../components/manutencoes/ManutencaoForm";

const HistoricoPage: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<IManutencaoResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [manutencaoParaDeletar, setManutencaoParaDeletar] =
    useState<IManutencaoResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false);
  const [editingManutencao, setEditingManutencao] =
    useState<IManutencaoResponse | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const data = await manutencaoService.listarHistoricoManutencoes();
      setManutencoes(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Falha ao buscar histórico de manutenções.";
      setPageError(errorMessage);
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const handleOpenDeleteDialog = (manutencao: IManutencaoResponse) => {
    setManutencaoParaDeletar(manutencao);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setManutencaoParaDeletar(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDeletarManutencao = async () => {
    if (!manutencaoParaDeletar) return;

    setDeleting(true);
    setPageError(null);
    try {
      await manutencaoService.deletarManutencao(manutencaoParaDeletar.id);
      setManutencoes((prevManutencoes) =>
        prevManutencoes.filter((m) => m.id !== manutencaoParaDeletar.id)
      );
      setSnackbarMessage("Manutenção deletada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar manutenção.";
      setPageError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Erro ao deletar manutenção:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEditarManutencaoModal = (manutencao: IManutencaoResponse) => {
    setEditingManutencao(manutencao);
    setIsManutencaoModalOpen(true);
  };

  const handleCloseManutencaoModal = () => {
    setIsManutencaoModalOpen(false);
    setEditingManutencao(null);
  };

  const handleSaveManutencao = async (
    manutencaoData: IManutencaoFormData,
    idManutencao?: number
  ) => {
    setFormSubmitting(true);
    setPageError(null);
    try {
      if (idManutencao && editingManutencao) {
        const dadosParaAtualizar: Partial<IManutencaoUpdate> = {
          descricaoServico: manutencaoData.descricaoServico,
          descricaoDetalhada: manutencaoData.descricaoDetalhada,
          dataExecucao: manutencaoData.dataExecucao
            ? new Date(manutencaoData.dataExecucao)
            : undefined,
          proximaData: manutencaoData.proximaData
            ? new Date(manutencaoData.proximaData)
            : manutencaoData.proximaData === ""
            ? null
            : undefined,
        };
        Object.keys(dadosParaAtualizar).forEach(
          (key) =>
            dadosParaAtualizar[key as keyof typeof dadosParaAtualizar] ===
              undefined &&
            delete dadosParaAtualizar[key as keyof typeof dadosParaAtualizar]
        );

        const manutencaoAtualizada =
          await manutencaoService.atualizarManutencao(
            idManutencao,
            dadosParaAtualizar
          );
        setManutencoes((prev) =>
          prev.map((m) => (m.id === idManutencao ? manutencaoAtualizada : m))
        );
        setSnackbarMessage("Manutenção atualizada com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        console.error(
          "Tentativa de criar manutenção a partir do formulário de edição do histórico ou ID de ativo faltando."
        );
        throw new Error(
          "Operação de salvar manutenção inválida neste contexto."
        );
      }
      handleCloseManutencaoModal();
    } catch (err: unknown) {
      console.error("Erro ao salvar manutenção (histórico):", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar manutenção.";
   
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason | string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ p: 3, height: "80vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Manutenções
      </Typography>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
        </Alert>
      )}

      {!loading && manutencoes.length === 0 && !pageError && (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          Nenhum registro de manutenção encontrado.
        </Typography>
      )}

      {manutencoes.length > 0 && (
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2 }}>
          <Table
            sx={{ minWidth: 750 }}
            aria-label="tabela de histórico de manutenções"
          >
            <TableHead sx={{ backgroundColor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Descrição do Serviço
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Data Execução
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Próxima Data
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Detalhes</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {manutencoes.map((manutencao) => (
                <TableRow
                  key={manutencao.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {manutencao.nomeAtivo || "N/A"}
                  </TableCell>
                  <TableCell>{manutencao.descricaoServico}</TableCell>
                  <TableCell align="center">
                    {manutencao.dataExecucao
                      ? new Date(
                          manutencao.dataExecucao + "T00:00:00Z"
                        ).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {manutencao.proximaData
                      ? new Date(
                          manutencao.proximaData + "T00:00:00Z"
                        ).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        manutencao.descricaoDetalhada ||
                        "Sem detalhes adicionais"
                      }
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "default",
                        }}
                      >
                        {manutencao.descricaoDetalhada || "-"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar Manutenção">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleOpenEditarManutencaoModal(manutencao)
                        }
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deletar Manutenção">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(manutencao)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {manutencaoParaDeletar && (
        <ConfirmacaoDialog
          open={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDeletarManutencao}
          title="Confirmar Exclusão de Manutenção"
          contentText={
            <>
              Tem certeza que deseja excluir a manutenção:
              <Typography
                component="span"
                fontWeight="bold"
                display="block"
                sx={{ mt: 1 }}
              >
                "{manutencaoParaDeletar.descricaoServico}"
              </Typography>
              para o ativo
              <Typography component="span" fontWeight="bold">
                {" "}
                "{manutencaoParaDeletar.nomeAtivo}"
              </Typography>
              , realizada em{" "}
              {manutencaoParaDeletar.dataExecucao
                ? new Date(
                    manutencaoParaDeletar.dataExecucao + "T00:00:00Z"
                  ).toLocaleDateString()
                : "data desconhecida"}
              ? Esta ação não poderá ser desfeita.
            </>
          }
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          isConfirming={deleting}
        />
      )}

      {editingManutencao && isManutencaoModalOpen && (
        <Modal
          open={isManutencaoModalOpen}
          onClose={handleCloseManutencaoModal}
          aria-labelledby="editar-manutencao-modal-title"
        >
          <Paper
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },
              bgcolor: "background.paper",
              boxShadow: 24,
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                id="editar-manutencao-modal-title"
                component="h2"
              >
                Editar Manutenção: {editingManutencao.descricaoServico}
              </Typography>
              <IconButton
                onClick={handleCloseManutencaoModal}
                size="small"
                aria-label="Fechar modal"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <ManutencaoForm
              ativoId={editingManutencao.ativoId}
              onSave={handleSaveManutencao}
              onCancel={handleCloseManutencaoModal}
              initialData={editingManutencao}
              isLoading={formSubmitting}
            />
          </Paper>
        </Modal>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }
          }
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoricoPage;