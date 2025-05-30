export interface IAtivo {
  id: number;           // ATV_ID
  usuarioId: number;    // USR_ID
  nome: string;         // ATV_NOME
  descricao?: string;   // ATV_DESCRICAO
  criadoEm: Date;      // ATV_CREATED_AT
}

export interface IAtivoCreate {
  usuarioId: number;
  nome: string;
  descricao?: string;
}

export interface IAtivoUpdate {
  nome?: string;
  descricao?: string;
}

export interface IAtivoResponse {
  id: number;
  usuarioId: number;
  nome: string;
  descricao?: string;
  criadoEm: string;
}