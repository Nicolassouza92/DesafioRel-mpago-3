import { UserService } from "../services/userService";
import { RequestHandler, Response as ExpressResponse } from "express";

export class UserController {
  static criar: RequestHandler = async (req, res) => {
    try {
      const dadosCriacao = req.body;
      const usuarioCriado = await UserService.criarUsuario(dadosCriacao);
      const { user, token } = await UserService.login(dadosCriacao.email, dadosCriacao.senha);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      }).status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  static login: RequestHandler = async (req, res) => {
    try {
      const { email, senha } = req.body;
      const { user, token } = await UserService.login(email, senha);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      }).json(user);
    } catch (error: any) {
      res.status(401).json({ erro: error.message });
    }
  };

  static logout: RequestHandler = async (req, res: ExpressResponse) => {
    try {
      await UserService.logout(res);
      res.status(200).json({ message: 'Logout bem-sucedido' });
    } catch (error: any) {
      res.status(500).json({ erro: error.message || 'Erro ao fazer logout' });
    }
  };

  static getProfile: RequestHandler = async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).json({ erro: 'Não autorizado - Nenhum usuário na requisição' });
        return;
      }
      const perfilUsuario = await UserService.buscarUsuarioPorId(req.user.id);
      if (!perfilUsuario) {
        res.status(404).json({ erro: 'Usuário não encontrado no banco de dados' });
        return;
      }
      res.json(perfilUsuario);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };

  static atualizar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (req.user?.id !== id) {
        res.status(403).json({ erro: 'Não autorizado a atualizar este usuário.' });
        return;
      }
      const usuario = await UserService.atualizarUsuario(id, req.body);
      res.json(usuario);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  static deletar: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (req.user?.id !== id) {
        res.status(403).json({ erro: 'Não autorizado a deletar este usuário.' });
        return;
      }
      const usuario = await UserService.deletarUsuario(id);
      if (req.user?.id === id) {
        await UserService.logout(res);
      }
      res.json(usuario);
    } catch (error: any) {
      res.status(404).json({ erro: error.message });
    }
  };

  static listarTodos: RequestHandler = async (req, res) => {
    try {
      const usuarios = await UserService.listarUsuarios();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };
}