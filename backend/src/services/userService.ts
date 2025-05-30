import jwt from 'jsonwebtoken';
import { IUserCreate, IUserResponse, IUserUpdate } from '../interfaces/user.interface'
import { UserRepository } from "../repositories/userRepository"
import { comparePassword } from '../utils/comparePassword';
import { Response } from 'express';

export class UserService {
  static async criarUsuario(dados: IUserCreate): Promise<IUserResponse> {
    if (!this.validarNome(dados.nome)) {
      throw new Error('Nome inválido.');
    }
    if (!this.validarEmail(dados.email)) {
      throw new Error('Email inválido.');
    }
    if (!this.validarSenha(dados.senha)) {
      throw new Error('Senha inválida.');
    }

    const usuarioExistente = await UserRepository.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado.');
    }

    return await UserRepository.criar(dados);
  }

  static async login(email: string, senha: string): Promise<{ user: IUserResponse; token: string }> {
    const usuario = await UserRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Email ou senha inválidos.');
    }

    const senhaValida = await comparePassword(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Email ou senha inválidos.');
    }

   
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET || 'segredo', { expiresIn: '1h' });

    const { senha: _, ...userResponse } = usuario;

    return { user: userResponse, token };
  }

static async atualizarUsuario(id: number, dados: IUserUpdate): Promise<IUserResponse> {
    const usuarioParaAtualizar = await UserRepository.buscarPorId(id);
    if (!usuarioParaAtualizar) {
      throw new Error('Usuário não encontrado para atualização.');
    }

    if (dados.novaSenha) {
      if (!dados.senhaAtual) {
        throw new Error('Senha atual é necessária para definir uma nova senha.');
      }
      const senhaAtualValida = await comparePassword(dados.senhaAtual, usuarioParaAtualizar.senha);
      if (!senhaAtualValida) {
        throw new Error('Senha atual incorreta.');
      }
      dados.senha = dados.novaSenha;
    }

    const { senhaAtual, novaSenha, ...dadosParaRepositorio } = dados;

    if (Object.keys(dadosParaRepositorio).length === 0) {
        const { senha, ...userResponse } = usuarioParaAtualizar;
        return userResponse;
    }

    const atualizado = await UserRepository.atualizar(id, dadosParaRepositorio);
    if (!atualizado) {
      throw new Error('Falha ao atualizar usuário ou usuário não encontrado após tentativa.');
    }
    return atualizado;
}

  static async deletarUsuario(id: number): Promise<IUserResponse> {
    const deletado = await UserRepository.deletar(id);
    if (!deletado) {
      throw new Error('Usuário não encontrado.');
    }
    return deletado;
  }

  static async listarUsuarios(): Promise<IUserResponse[]> {
    return await UserRepository.listarTodos();
  }

  private static validarNome(nome: string): boolean {
    return nome.trim().length >= 4;
  }

  private static validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private static validarSenha(senha: string): boolean {
    return senha.length >= 8;
  }

  static async buscarUsuarioPorId(id: number): Promise<IUserResponse | null> {
    const usuario = await UserRepository.buscarPorId(id);
    if (!usuario) {
      return null;
    }

    const { senha, ...userResponse } = usuario;
    return userResponse;
  }

  static async logout(res: Response): Promise<void> {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Boa prática
    });
  }
}