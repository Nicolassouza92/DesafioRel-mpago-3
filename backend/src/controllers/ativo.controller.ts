import { RequestHandler } from "express";
import { AtivoService } from "../services/ativoService";

// Remova a declaração 'declare module 'express'' daqui, pois está centralizada

export class AtivoController {
  static criar: RequestHandler = async (req, res) => {
    try {
      // Agora req.user deve ser reconhecido pelo TypeScript
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        // Não use 'return' aqui
        res.status(401).json({ erro: "Usuário não autenticado" });
        return; // Adicione um return vazio
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
    console.log("ATIVO CONTROLLER - ATUALIZAR: req.user:", req.user); // <--- ADICIONE ISSO
    console.log("ATIVO CONTROLLER - ATUALIZAR: req.params.id:", req.params.id);
    try {
      const id = Number(req.params.id);
      // Adicionar verificação: O usuário logado é o dono do ativo?
      // Isso exigiria buscar o ativo e comparar req.user.id com ativo.usuarioId
      // Por ora, simplificado:
      const ativo = await AtivoService.atualizarAtivo(
        id,
        req.body,
        req.user?.id
      ); // Modificar service para aceitar userId para verificação
      if (!ativo) {
        // Se o service retornar null por não permissão ou não encontrado
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
      // Adicionar verificação de posse similar à de atualizar
      const ativo = await AtivoService.deletarAtivo(id, req.user?.id); // Modificar service para aceitar userId para verificação
      if (!ativo) {
        res
          .status(404)
          .json({ erro: "Ativo não encontrado ou você não tem permissão." });
        return;
      }
      res.json(ativo);
    } catch (error: any) {
      // O service pode lançar erro se não encontrado, então o catch pode ser 404 ou 400.
      // Se o service retornar null em caso de não encontrado ou sem permissão, o erro 404 acima é mais apropriado.
      res.status(400).json({ erro: error.message }); // Ou 404 se for a semântica mais correta
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
