import { RequestHandler } from "express";
import { AtivoService } from "../services/ativoService";

export class AtivoController {
  static criar: RequestHandler = async (req, res) => {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: "Usuário não autenticado" });
        return;
      }
      const ativo = await AtivoService.criarAtivo({
        ...req.body,
        usuarioId,
      });
      res.status(201).json(ativo);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  static atualizar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ativo = await AtivoService.atualizarAtivo(
        id,
        req.body,
        req.user?.id
      );
      if (!ativo) {
        res
          .status(404)
          .json({ erro: "Ativo não encontrado ou você não tem permissão." });
        return;
      }
      res.json(ativo);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  static deletar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ativo = await AtivoService.deletarAtivo(id, req.user?.id);
      if (!ativo) {
        res
          .status(404)
          .json({ erro: "Ativo não encontrado ou você não tem permissão." });
        return;
      }
      res.json(ativo);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  static listarTodos: RequestHandler = async (req, res) => {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: "Usuário não autenticado" });
        return;
      }
      const ativos = await AtivoService.listarAtivosPorUsuario(usuarioId);
      res.json(ativos);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };
}