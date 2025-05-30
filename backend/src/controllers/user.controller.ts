import { UserService } from "../services/userService";
import { RequestHandler, Response as ExpressResponse } from "express";

export class UserController {
    static criar: RequestHandler = async (req, res) => {
    try {
      const dadosCriacao = req.body;
      // Primeiro, cria o usuário
      const usuarioCriado = await UserService.criarUsuario(dadosCriacao);

      // Se chegou aqui, o usuário foi criado com sucesso. Agora, faz o login.
      // Usamos os dados originais para o login (email e senha não hasheada)
      const { user, token } = await UserService.login(dadosCriacao.email, dadosCriacao.senha);
      
      // Seta o cookie e retorna os dados do usuário (sem a senha)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      }).status(201).json(user); // Retorna o objeto 'user' do login, que já é IUserResponse

    } catch (error: any) {
      // Se criarUsuario lançar "Email já cadastrado", ou login falhar (improvável aqui)
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
       // Validação: um usuário só deve poder deletar seu próprio perfil, a menos que seja admin
       if (req.user?.id !== id) {
        res.status(403).json({ erro: 'Não autorizado a deletar este usuário.' });
        return;
      }
      const usuario = await UserService.deletarUsuario(id);
      // Após deletar, o cookie de token deve ser invalidado se o usuário deletou a si mesmo
      if (req.user?.id === id) {
        await UserService.logout(res); // Chama o logout para limpar o cookie
      }
      res.json(usuario); // Ou uma mensagem de sucesso
    } catch (error: any) {
      res.status(404).json({ erro: error.message });
    }
  };

  static listarTodos: RequestHandler = async (req, res) => {
    // Esta rota deve ser protegida e, idealmente, apenas para administradores.
    // Por enquanto, vamos assumir que qualquer usuário autenticado pode listar (verifique seus requisitos).
    try {
      const usuarios = await UserService.listarUsuarios();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };
}