export interface IManutencao {
  id: number;
  ativoId: number;
  descricaoServico: string;
  descricaoDetalhada?: string; // Agora opcional
  dataExecucao: Date;
  proximaData?: Date;
  criadoEm: Date;
}

export interface IManutencaoCreate {
  ativoId: number;
  descricaoServico: string;
  descricaoDetalhada?: string; // Opcional na criação
  dataExecucao: Date; 
  proximaData?: Date; 
}

export interface IManutencaoUpdate {
  descricaoServico?: string;
  descricaoDetalhada?: string | null; // Permitir string ou null para limpar explicitamente
  dataExecucao?: Date;
  proximaData?: Date | null; // Permitir Date ou null para limpar explicitamente
}

export interface IManutencaoResponse {
  id: number;
  ativoId: number;
  nomeAtivo?: string; 
  descricaoServico: string;
  descricaoDetalhada?: string; // Opcional na resposta
  dataExecucao: string; 
  proximaData?: string; 
  criadoEm: string; 
}

export interface IManutencaoPendentePainel extends IManutencaoResponse {
  nomeAtivo: string; 
  statusUrgencia: 'vencida' | 'proxima' | 'muito_proxima'; 
}