import { RequestHandler } from "express";
import { ManutencaoService } from "../services/manutencaoService";

export class ManutencaoController {
  static criar: RequestHandler = async (req, res) => {
    try {
      const manutencao = await ManutencaoService.criarManutencao(req.body);
      res.status(201).json(manutencao);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

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
      res.status(400).json({ erro: error.message });
    }
  };
}