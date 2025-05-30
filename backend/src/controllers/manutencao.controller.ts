import { RequestHandler } from "express";
import { ManutencaoService } from "../services/manutencaoService";

// Supondo que req.user é populado pelo authMiddleware
// e a declaração global de req.user existe

export class ManutencaoController {
  static criar: RequestHandler = async (req, res) => {
    try {
      // Validação de que o ativoId pertence ao usuário logado deve ser feita aqui ou no service
      // Por simplicidade, assumimos que o frontend envia o ativoId correto.
      // Para maior segurança, o AtivoService.buscarPorId(req.body.ativoId) deve ser
      // chamado para verificar se req.user.id === ativo.usuarioId.
      const manutencao = await ManutencaoService.criarManutencao(req.body);
      res.status(201).json(manutencao);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  // Endpoint para o Histórico de Manutenções
  static listarManutencoesUsuario: RequestHandler = async (req, res) => {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }
      const manutencoes = await ManutencaoService.listarManutencoesPorUsuario(usuarioId);
      res.json(manutencoes);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };

  // Endpoint para o Painel de Manutenções Pendentes
  static listarPendentes: RequestHandler = async (req, res) => {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }
      const pendentes = await ManutencaoService.listarManutencoesPendentes(usuarioId);
      res.json(pendentes);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };


  static atualizar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }
      const manutencao = await ManutencaoService.atualizarManutencao(id, req.body, usuarioId);
      res.json(manutencao);
    } catch (error: any) {
      // Se o erro for de 'Não autorizado', poderia retornar 403
      res.status(400).json({ erro: error.message });
    }
  };

  static deletar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }
      const manutencao = await ManutencaoService.deletarManutencao(id, usuarioId);
      res.json(manutencao);
    } catch (error: any) {
      // Se o erro for de 'Não encontrado', poderia retornar 404. Se 'Não autorizado', 403.
      res.status(400).json({ erro: error.message }); // Ou um status mais específico
    }
  };

}