export interface IManutencao {
  id: number;
  ativoId: number;
  descricaoServico: string;
  descricaoDetalhada?: string;
  dataExecucao: Date;
  proximaData?: Date;
  criadoEm: Date;
}

export interface IManutencaoCreate {
  ativoId: number;
  descricaoServico: string;
  descricaoDetalhada?: string;
  dataExecucao: Date; 
  proximaData?: Date; 
}

export interface IManutencaoUpdate {
  descricaoServico?: string;
  descricaoDetalhada?: string | null;
  dataExecucao?: Date;
  proximaData?: Date | null;
}

export interface IManutencaoResponse {
  id: number;
  ativoId: number;
  nomeAtivo?: string; 
  descricaoServico: string;
  descricaoDetalhada?: string;
  dataExecucao: string; 
  proximaData?: string; 
  criadoEm: string; 
}

export interface IManutencaoPendentePainel extends IManutencaoResponse {
  nomeAtivo: string; 
  statusUrgencia: 'vencida' | 'proxima' | 'muito_proxima'; 
}