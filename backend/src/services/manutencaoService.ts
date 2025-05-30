import { IManutencaoCreate, IManutencaoUpdate, IManutencaoResponse, IManutencaoPendentePainel } from "../interfaces/manutencao.interface";
import { ManutencaoRepository } from "../repositories/manutencaoRepository";
import { AtivoRepository } from "../repositories/ativoRepository"; 

export class ManutencaoService {
  static async criarManutencao(manutencao: IManutencaoCreate): Promise<IManutencaoResponse> {
    if (!manutencao.descricaoServico?.trim()) {
      throw new Error('Descrição do serviço é obrigatória');
    }
    return ManutencaoRepository.criar(manutencao);
  }

  static async atualizarManutencao(id: number, manutencao: IManutencaoUpdate, usuarioId: number): Promise<IManutencaoResponse> {
    const manutencaoExistente = await ManutencaoRepository.buscarPorId(id);

    if (!manutencaoExistente) {
      throw new Error('Manutenção não encontrada.');
    }

    if (manutencaoExistente.ativoId === undefined || manutencaoExistente.ativoId === null) {
      throw new Error(`Manutenção ${id} não possui um ativoId válido associado.`);
    }

    const ativoIdDaManutencao = manutencaoExistente.ativoId;
    const ativoDaManutencao = await AtivoRepository.buscarPorId(manutencaoExistente.ativoId);

    if (!ativoDaManutencao || ativoDaManutencao.usuarioId !== usuarioId) {
      throw new Error('Não autorizado a atualizar esta manutenção.');
    }

    if (ativoDaManutencao.usuarioId !== usuarioId) {
      throw new Error('Não autorizado a atualizar esta manutenção.');
    }
    
    const keys = Object.keys(manutencao);
    let hasActualUpdate = false;
    for (const key of keys) {
      if (manutencao[key as keyof IManutencaoUpdate] !== undefined) {
        hasActualUpdate = true;
        break;
      }
    }
    if (manutencao.hasOwnProperty('descricaoDetalhada') || manutencao.hasOwnProperty('proximaData')) {
      hasActualUpdate = true;
    }

    if (!hasActualUpdate) {
      return manutencaoExistente;
    }

    const result = await ManutencaoRepository.atualizar(id, manutencao);
    if (!result) {
      throw new Error('Falha ao atualizar manutenção.'); 
    }
    return result;
  }

  static async deletarManutencao(id: number, usuarioId: number): Promise<IManutencaoResponse> {
    const manutencaoExistente = await ManutencaoRepository.buscarPorId(id);
    if (!manutencaoExistente) {
      throw new Error('Manutenção não encontrada.');
    }
    const ativoDaManutencao = await AtivoRepository.buscarPorId(manutencaoExistente.ativoId);
    if (!ativoDaManutencao || ativoDaManutencao.usuarioId !== usuarioId) {
      throw new Error('Não autorizado a deletar esta manutenção.');
    }

    const result = await ManutencaoRepository.deletar(id);
    if (!result) {
      throw new Error('Falha ao deletar manutenção ou manutenção não encontrada.');
    }
    return result;
  }

  static async listarManutencoesPorUsuario(usuarioId: number): Promise<IManutencaoResponse[]> {
    return ManutencaoRepository.listarTodasManutencoesPorUsuario(usuarioId);
  }

  static async listarManutencoesPendentes(usuarioId: number): Promise<IManutencaoPendentePainel[]> {
    const todasManutencoesUsuario = await ManutencaoRepository.listarTodasManutencoesPorUsuario(usuarioId);
    const pendenciasAgrupadas: { [key: string]: IManutencaoPendentePainel } = {}; 

    for (const manutencao of todasManutencoesUsuario) {
      if (!manutencao.proximaData) {
        continue; 
      }

      const chaveGrupo = `${manutencao.ativoId}-${manutencao.descricaoServico.toLowerCase().trim()}`;
      
      if (!pendenciasAgrupadas[chaveGrupo]) {
        const proximaDataDate = new Date(manutencao.proximaData);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 
        proximaDataDate.setHours(0,0,0,0); 

        let statusUrgencia: IManutencaoPendentePainel['statusUrgencia'] = 'proxima';
        const diffTime = proximaDataDate.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          statusUrgencia = 'vencida';
        } else if (diffDays <= 7) { 
          statusUrgencia = 'muito_proxima';
        }
        
        if (statusUrgencia === 'vencida' || statusUrgencia === 'muito_proxima' || statusUrgencia === 'proxima') { 
          pendenciasAgrupadas[chaveGrupo] = {
            ...manutencao,
            nomeAtivo: manutencao.nomeAtivo || 'Ativo Desconhecido', 
            statusUrgencia,
          };
        }
      }
    }
    
    return Object.values(pendenciasAgrupadas).sort((a, b) => {
      const statusOrder = { 'vencida': 1, 'muito_proxima': 2, 'proxima': 3 };
      if (statusOrder[a.statusUrgencia] !== statusOrder[b.statusUrgencia]) {
        return statusOrder[a.statusUrgencia] - statusOrder[b.statusUrgencia];
      }
      return new Date(a.proximaData!).getTime() - new Date(b.proximaData!).getTime();
    });
  }
}