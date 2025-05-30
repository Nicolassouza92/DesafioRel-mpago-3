import { IManutencaoCreate, IManutencaoUpdate, IManutencaoResponse, IManutencaoPendentePainel } from "../interfaces/manutencao.interface";
import { ManutencaoRepository } from "../repositories/manutencaoRepository";
import { AtivoRepository } from "../repositories/ativoRepository"; 

export class ManutencaoService {
  static async criarManutencao(manutencao: IManutencaoCreate): Promise<IManutencaoResponse> {
    if (!manutencao.descricaoServico?.trim()) {
      throw new Error('Descrição do serviço é obrigatória');
    }
    // descricaoDetalhada é opcional, não precisa de validação aqui se for string vazia ou null
    return ManutencaoRepository.criar(manutencao);
  }

  static async atualizarManutencao(id: number, manutencao: IManutencaoUpdate, usuarioId: number): Promise<IManutencaoResponse> {
     console.log(`MANUTENCAO SERVICE - ATUALIZAR: Tentando atualizar ativo ID: ${id}, Solicitante ID: ${usuarioId}`);
    
    const manutencaoExistente = await ManutencaoRepository.buscarPorId(id);

    console.log('MANUTENCAO SERVICE - ATUALIZAR: Objeto manutencaoExistente RAW:', manutencaoExistente);

    if (!manutencaoExistente) {
      console.error(`MANUTENCAO SERVICE - ATUALIZAR: Manutenção com ID ${id} NÃO encontrada.`);
      throw new Error('Manutenção não encontrada.');
    }
    
    console.log(`MANUTENCAO SERVICE - ATUALIZAR: manutencaoExistente.ativoId = ${manutencaoExistente.ativoId} (tipo: ${typeof manutencaoExistente.ativoId})`);

    if (manutencaoExistente.ativoId === undefined || manutencaoExistente.ativoId === null) {
        console.error(`MANUTENCAO SERVICE - ATUALIZAR: ERRO CRÍTICO - ativoId na manutenção ${id} é undefined ou null.`);
        throw new Error(`Manutenção ${id} não possui um ativoId válido associado.`);
    }

    const ativoIdDaManutencao = manutencaoExistente.ativoId;
    console.log(`MANUTENCAO SERVICE - ATUALIZAR: ID do ativo da manutenção ${id} é: ${ativoIdDaManutencao}`);

    const ativoDaManutencao = await AtivoRepository.buscarPorId(manutencaoExistente.ativoId);
    console.log(`MANUTENCAO SERVICE - ATUALIZAR: Ativo encontrado para a manutenção. Dono ID: ${ativoDaManutencao?.usuarioId}`);

    if (!ativoDaManutencao || ativoDaManutencao.usuarioId !== usuarioId) {
      console.error(`MANUTENCAO SERVICE - ATUALIZAR: ERRO CRÍTICO - Ativo com ID ${ativoIdDaManutencao} (da manutenção ${id}) NÃO foi encontrado.`);
      throw new Error('Não autorizado a atualizar esta manutenção.');
    }

    console.log(`MANUTENCAO SERVICE - ATUALIZAR: Ativo encontrado para a manutenção. Dono (USR_ID do ativo): ${ativoDaManutencao.usuarioId}`);

     if (ativoDaManutencao.usuarioId !== usuarioId) { // usuarioId aqui é o req.user.id
      console.error(`MANUTENCAO SERVICE - ATUALIZAR: FALHA NA AUTORIZAÇÃO! Dono do ativo: ${ativoDaManutencao.usuarioId}, Solicitante (req.user.id): ${usuarioId}`);
      throw new Error('Não autorizado a atualizar esta manutenção.');
    }
    
    // Checa se o objeto 'manutencao' está vazio, mas permite que descricaoDetalhada ou proximaData sejam explicitamente setadas para null
    const keys = Object.keys(manutencao);
    let hasActualUpdate = false;
    for (const key of keys) {
        if (manutencao[key as keyof IManutencaoUpdate] !== undefined) { // Se qualquer valor for diferente de undefined, é uma atualização
            hasActualUpdate = true;
            break;
        }
    }
    // Se descricaoDetalhada ou proximaData foram passadas como null, também conta como atualização
    if (manutencao.hasOwnProperty('descricaoDetalhada') || manutencao.hasOwnProperty('proximaData')) {
        hasActualUpdate = true;
    }


    if (!hasActualUpdate) {
      return manutencaoExistente; // Retorna a existente se não há nada para atualizar
    }

    const result = await ManutencaoRepository.atualizar(id, manutencao);
    if (!result) {
      // Esta condição pode ser difícil de alcançar se a manutencaoExistente foi encontrada
      // e hasActualUpdate é true, a menos que o DB falhe.
      throw new Error('Falha ao atualizar manutenção.'); 
    }
    return result;
  }

  // ... (deletarManutencao, listarManutencoesPorUsuario, listarManutencoesPendentes permanecem os mesmos da resposta anterior) ...
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
        // proximaData pode ser undefined/null se a query não formatar para string ''
        // e o tipo for Date | undefined. Aqui, IManutencaoResponse tem proximaData? : string
        // então é seguro usar new Date().
        return new Date(a.proximaData!).getTime() - new Date(b.proximaData!).getTime();
    });
  }
}