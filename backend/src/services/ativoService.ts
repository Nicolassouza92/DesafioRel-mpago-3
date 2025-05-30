import {
  IAtivoCreate,
  IAtivoResponse,
  IAtivoUpdate,
} from "../interfaces/ativo.interface";
import { AtivoRepository } from "../repositories/ativoRepository";

export class AtivoService {
  static async criarAtivo(dados: IAtivoCreate): Promise<IAtivoResponse> {
    if (!dados.nome.trim()) {
      throw new Error("Nome do ativo é obrigatório.");
    }

    return await AtivoRepository.criar(dados);
  }

  static async buscarAtivoPorId(id: number): Promise<IAtivoResponse | null> {
    const ativo = await AtivoRepository.buscarPorId(id);
    if (!ativo) {
      throw new Error("Ativo não encontrado.");
    }
    return ativo;
  }

  static async listarAtivosPorUsuario(
    usuarioId: number
  ): Promise<IAtivoResponse[]> {
    return await AtivoRepository.listarPorUsuario(usuarioId);
  }

  static async atualizarAtivo(
    id: number,
    dados: IAtivoUpdate,
    solicitanteUsuarioId?: number
  ): Promise<IAtivoResponse> {
    const ativoExistente = await AtivoRepository.buscarPorId(id);
    if (!ativoExistente) {
      throw new Error("Ativo não encontrado.");
    }

    if (
      solicitanteUsuarioId !== undefined &&
      ativoExistente.usuarioId !== solicitanteUsuarioId
    ) {
      throw new Error("Não autorizado a atualizar este ativo.");
    }

    if (Object.keys(dados).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const ativo = await AtivoRepository.atualizar(id, dados);
    if (!ativo) {
      throw new Error("Ativo não encontrado após tentativa de atualização.");
    }
    return ativo;
  }

  static async deletarAtivo(
    id: number,
    solicitanteUsuarioId?: number
  ): Promise<IAtivoResponse> {
    const ativoExistente = await AtivoRepository.buscarPorId(id);
    if (!ativoExistente) {
      throw new Error("Ativo não encontrado.");
    }
    if (
      solicitanteUsuarioId !== undefined &&
      ativoExistente.usuarioId !== solicitanteUsuarioId
    ) {
      throw new Error("Não autorizado a deletar este ativo.");
    }

    const ativo = await AtivoRepository.deletar(id);
    if (!ativo) {
      throw new Error("Ativo não encontrado após tentativa de deleção.");
    }
    return ativo;
  }
}