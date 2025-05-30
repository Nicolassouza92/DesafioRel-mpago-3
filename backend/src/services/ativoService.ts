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
    console.log(
      `ATIVO SERVICE - ATUALIZAR: Tentando atualizar ativo ID: ${id}, Solicitante ID: ${solicitanteUsuarioId}`
    );

    const ativoExistente = await AtivoRepository.buscarPorId(id);
    if (!ativoExistente) {
      throw new Error("Ativo não encontrado.");
    }
    console.log(
      `ATIVO SERVICE - VERIFICAÇÃO: solicitanteUsuarioId=${solicitanteUsuarioId} (tipo: ${typeof solicitanteUsuarioId})`
    );
    console.log(
      `ATIVO SERVICE - VERIFICAÇÃO: ativoExistente.usuarioId=${
        ativoExistente.usuarioId
      } (tipo: ${typeof ativoExistente.usuarioId})`
    );

    if (
      solicitanteUsuarioId !== undefined &&
      ativoExistente.usuarioId !== solicitanteUsuarioId
    ) {
      console.error(
        `ATIVO SERVICE - ATUALIZAR: FALHA NA AUTORIZAÇÃO! Dono: ${ativoExistente.usuarioId}, Solicitante: ${solicitanteUsuarioId}`
      );

      throw new Error("Não autorizado a atualizar este ativo.");
    }

    if (Object.keys(dados).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }
    // ... o restante da lógica de atualização
    const ativo = await AtivoRepository.atualizar(id, dados);
    if (!ativo) {
      // Esta verificação pode ser redundante se buscarPorId já confirmou
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
      // Esta verificação pode ser redundante
      throw new Error("Ativo não encontrado após tentativa de deleção.");
    }
    return ativo;
  }
}
