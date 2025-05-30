import { useEffect, useState } from 'react';
import CardAtivoManutencao from "./CardAtivoManutencao";
import { 
  Box, Typography, CircularProgress, Alert, Modal, Paper, IconButton 
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import * as manutencaoService from '../api/manutencaoService';
import type { IManutencaoPendentePainel } from '../../../backend/src/interfaces/manutencao.interface';
import type { IManutencaoFormData } from '../api/manutencaoService'; // Importar para o save
import ManutencaoForm from './manutencoes/ManutencaoForm'; // Importar o formulário

export default function PainelManutencoesPendentes() {
  const [pendencias, setPendencias] = useState<IManutencaoPendentePainel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o Modal de Manutenção
  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false);
  // Guarda a pendência selecionada para pré-preencher o formulário
  const [manutencaoSelecionadaParaRegistro, setManutencaoSelecionadaParaRegistro] = useState<IManutencaoPendentePainel | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);


  const fetchPendencias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await manutencaoService.listarManutencoesPendentes();
      setPendencias(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Falha ao buscar manutenções pendentes.");
      } else {
        setError("Ocorreu um erro desconhecido ao buscar pendências.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendencias();
  }, []);

  const handleOpenRegistrarManutencaoModal = (pendencia: IManutencaoPendentePainel) => {
    setManutencaoSelecionadaParaRegistro(pendencia);
    setIsManutencaoModalOpen(true);
  };

  const handleCloseManutencaoModal = () => {
    setIsManutencaoModalOpen(false);
    setManutencaoSelecionadaParaRegistro(null);
  };

  const handleSaveManutencao = async (manutencaoData: IManutencaoFormData) => {
    // O ativoId já está em manutencaoData, pois ManutencaoForm o incluirá.
    // Se ManutencaoForm não incluir ativoId, precisamos pegá-lo de manutencaoSelecionadaParaRegistro.
    if (!manutencaoSelecionadaParaRegistro?.ativoId) {
        setError("Não foi possível identificar o ativo para registrar a manutenção.");
        return;
    }

    setFormSubmitting(true);
    try {
        // Certifique-se que manutencaoData inclui ativoId, ou adicione-o:
        const dadosCompletosParaCriar: IManutencaoFormData = {
            ...manutencaoData,
            ativoId: manutencaoSelecionadaParaRegistro.ativoId,
        };

      await manutencaoService.criarManutencao(dadosCompletosParaCriar);
      alert('Manutenção registrada com sucesso! O painel será atualizado.');
      handleCloseManutencaoModal();
      fetchPendencias(); // ATUALIZA O PAINEL!
    } catch (err: unknown) {
      // O ManutencaoForm deve tratar seus próprios erros, mas podemos logar aqui
      console.error("Erro ao salvar manutenção a partir do painel:", err);
      // Poderia setar um erro no Alert do painel se o ManutencaoForm não mostrar
      if (err instanceof Error) { setError(err.message); } 
      else { setError("Erro desconhecido ao salvar manutenção.");}
    } finally {
      setFormSubmitting(false);
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3, height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        📋 Painel de Manutenções Pendentes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && pendencias.length === 0 && !error && (
        <Typography sx={{textAlign: 'center', mt: 4}}>
          Nenhuma manutenção pendente no momento. Tudo em dia! 👍
        </Typography>
      )}

      {pendencias.map((pendencia) => {
        let statusColor: "error" | "warning" | "info" = "info";
        if (pendencia.statusUrgencia === 'vencida') statusColor = 'error';
        else if (pendencia.statusUrgencia === 'muito_proxima') statusColor = 'warning';
        
        const descricaoCard = `${pendencia.descricaoServico} - ${
          pendencia.statusUrgencia === 'vencida' ? 'Venceu em' : 'Próxima:'
        } ${pendencia.proximaData ? new Date(pendencia.proximaData + 'T00:00:00').toLocaleDateString() : 'N/A'}`;

        return (
          <CardAtivoManutencao
            key={`${pendencia.ativoId}-${pendencia.id}`}
            nomeAtivo={pendencia.nomeAtivo}
            descricao={descricaoCard}
            statusColor={statusColor}
            onRegistrarClick={() => handleOpenRegistrarManutencaoModal(pendencia)}
          />
        );
      })}

      {/* Modal para Registrar Manutenção */}
      {manutencaoSelecionadaParaRegistro && (
        <Modal
          open={isManutencaoModalOpen}
          onClose={handleCloseManutencaoModal}
          aria-labelledby="registrar-manutencao-modal-title"
        >
          <Paper sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
          }}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" id="registrar-manutencao-modal-title">
                    Realizei Manutenção: {manutencaoSelecionadaParaRegistro.nomeAtivo}
                </Typography>
                <IconButton onClick={handleCloseManutencaoModal} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
            <ManutencaoForm
              ativoId={manutencaoSelecionadaParaRegistro.ativoId}
              initialDescricaoServico={manutencaoSelecionadaParaRegistro.descricaoServico} // Passando a descrição
              onSave={handleSaveManutencao}
              onCancel={handleCloseManutencaoModal}
              isLoading={formSubmitting}
              initialData={null} 
            />
          </Paper>
        </Modal>
      )}
    </Box>
  );
}