import pool from "../config/database";
import { IManutencaoCreate, IManutencaoUpdate, IManutencaoResponse } from "../interfaces/manutencao.interface";

export class ManutencaoRepository {
  static async criar(manutencao: IManutencaoCreate): Promise<IManutencaoResponse> {
    const { ativoId, descricaoServico, descricaoDetalhada, dataExecucao, proximaData } = manutencao;
    const result = await pool.query(
      `INSERT INTO manutencoes (ATV_ID, MAN_DES_SERVICO, MAN_DESCRICAO_DETALHADA, MAN_DATA_EXECUCAO, MAN_PROXIMA_DATA)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING 
         MAN_ID as "id", 
         ATV_ID as "ativoId", 
         MAN_DES_SERVICO as "descricaoServico", 
         MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
         TO_CHAR(MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
         TO_CHAR(MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
         TO_CHAR(MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm"`,
      [ativoId, descricaoServico, descricaoDetalhada, dataExecucao, proximaData]
    );
    return result.rows[0];
  }

  static async atualizar(id: number, manutencao: IManutencaoUpdate): Promise<IManutencaoResponse | null> {
    const { descricaoServico, descricaoDetalhada, dataExecucao, proximaData } = manutencao;
    const fields: string[] = [];
    const values: any[] = [];
    let query = 'UPDATE manutencoes SET ';

    if (descricaoServico !== undefined) {
      fields.push(`MAN_DES_SERVICO = $${values.push(descricaoServico)}`);
    }
    if (manutencao.hasOwnProperty('descricaoDetalhada')) { 
        fields.push(`MAN_DESCRICAO_DETALHADA = $${values.push(descricaoDetalhada)}`);
    }
    if (dataExecucao !== undefined) {
      fields.push(`MAN_DATA_EXECUCAO = $${values.push(dataExecucao)}`);
    }
    if (manutencao.hasOwnProperty('proximaData')) { 
        fields.push(`MAN_PROXIMA_DATA = $${values.push(proximaData)}`);
    }

    if (fields.length === 0) {
      const manutencaoExistente = await this.buscarPorId(id);
      return manutencaoExistente;
    }

    query += fields.join(', ');
    query += ` WHERE MAN_ID = $${values.push(id)} RETURNING 
                 MAN_ID as id, ATV_ID as ativoId, MAN_DES_SERVICO as "descricaoServico", 
                 MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
                 TO_CHAR(MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
                 TO_CHAR(MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
                 TO_CHAR(MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm"`;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async buscarPorId(id: number): Promise<IManutencaoResponse | null> {
    const result = await pool.query(
      `SELECT MAN_ID as "id", ATV_ID as "ativoId", MAN_DES_SERVICO as "descricaoServico", 
       MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
       TO_CHAR(MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
       TO_CHAR(MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
       TO_CHAR(MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm" 
       FROM manutencoes
       WHERE MAN_ID = $1`,
      [id]
    );
    console.log(`DEBUG ManutencaoRepository.buscarPorId(${id}) - Linha bruta:`, result.rows[0]);
    return result.rows[0] || null;
  }

  static async deletar(id: number): Promise<IManutencaoResponse | null> {
    const result = await pool.query(
      `DELETE FROM manutencoes 
       WHERE MAN_ID = $1 
       RETURNING MAN_ID as "id", ATV_ID as "ativoId", MAN_DES_SERVICO as "descricaoServico", 
       MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
       TO_CHAR(MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
       TO_CHAR(MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
       TO_CHAR(MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm"`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async listarPorAtivo(ativoId: number): Promise<IManutencaoResponse[]> {
    const result = await pool.query(
      `SELECT 
         m.MAN_ID as "id", 
         m.ATV_ID as "ativoId", 
         a.ATV_NOME as "nomeAtivo",
         m.MAN_DES_SERVICO as "descricaoServico", 
         m.MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
         TO_CHAR(m.MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
         TO_CHAR(m.MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
         TO_CHAR(m.MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm" 
       FROM manutencoes m
       JOIN ativos a ON m.ATV_ID = a.ATV_ID
       WHERE m.ATV_ID = $1
       ORDER BY m.MAN_DATA_EXECUCAO DESC`,
      [ativoId]
    );
    return result.rows;
  }

  static async listarTodasManutencoesPorUsuario(usuarioId: number): Promise<IManutencaoResponse[]> {
    const result = await pool.query(
      `SELECT 
         m.MAN_ID as "id", 
         m.ATV_ID as "ativoId", 
         a.ATV_NOME as "nomeAtivo",
         m.MAN_DES_SERVICO as "descricaoServico", 
         m.MAN_DESCRICAO_DETALHADA as "descricaoDetalhada",
         TO_CHAR(m.MAN_DATA_EXECUCAO, 'YYYY-MM-DD') as "dataExecucao", 
         TO_CHAR(m.MAN_PROXIMA_DATA, 'YYYY-MM-DD') as "proximaData", 
         TO_CHAR(m.MAN_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm" 
       FROM manutencoes m
       JOIN ativos a ON m.ATV_ID = a.ATV_ID
       WHERE a.USR_ID = $1
       ORDER BY m.MAN_DATA_EXECUCAO DESC, m.MAN_ID DESC`,
      [usuarioId]
    );
    return result.rows;
  }
}