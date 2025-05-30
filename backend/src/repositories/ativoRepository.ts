import pool from "../config/database";
import {
  IAtivoCreate,
  IAtivoUpdate,
  IAtivoResponse,
} from "../interfaces/ativo.interface";

export class AtivoRepository {
  static async criar(ativo: IAtivoCreate): Promise<IAtivoResponse> {
    const { usuarioId, nome, descricao } = ativo;
    const result = await pool.query(
      `INSERT INTO ativos (USR_ID, ATV_NOME, ATV_DESCRICAO)
       VALUES ($1, $2, $3) 
       RETURNING ATV_ID as "id", USR_ID as "usuarioId", ATV_NOME as "nome", 
       ATV_DESCRICAO as "descricao", ATV_CREATED_AT as "criadoEm"`,
      [usuarioId, nome, descricao]
    );
    return result.rows[0];
  }

  static async buscarPorId(id: number): Promise<IAtivoResponse | null> {
    const result = await pool.query(
      `SELECT 
         ATV_ID as "id", 
         USR_ID as "usuarioId",  
         ATV_NOME as "nome",
         ATV_DESCRICAO as "descricao", 
         TO_CHAR(ATV_CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') as "criadoEm"
       FROM ativos 
       WHERE ATV_ID = $1`,
      [id]
    );
    console.log('DEBUG AtivoRepository.buscarPorId - Linha retornada:', result.rows[0]); 
    
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        usuarioId: row.usuarioId,
        nome: row.nome,
        descricao: row.descricao,
        criadoEm: row.atv_created_at ? new Date(row.atv_created_at).toISOString() : ''
      };
    }
    return result.rows[0] || null;
  }

  static async listarPorUsuario(usuarioId: number): Promise<IAtivoResponse[]> {
    const result = await pool.query(
      `SELECT ATV_ID as "id", USR_ID as "usuarioId", ATV_NOME as "nome",
       ATV_DESCRICAO as "descricao", ATV_CREATED_AT as "criadoEm"
       FROM ativos WHERE USR_ID = $1`,
      [usuarioId]
    );
    return result.rows;
  }

  static async atualizar(
    id: number,
    ativo: IAtivoUpdate
  ): Promise<IAtivoResponse | null> {
    const { nome, descricao } = ativo;
    const result = await pool.query(
      `UPDATE ativos 
       SET ATV_NOME = $1, ATV_DESCRICAO = $2 
       WHERE ATV_ID = $3 
       RETURNING ATV_ID as "id", USR_ID as "usuarioId", ATV_NOME as "nome",
       ATV_DESCRICAO as "descricao", ATV_CREATED_AT as "criadoEm"`,
      [nome, descricao, id]
    );
    return result.rows[0] || null;
  }

  static async deletar(id: number): Promise<IAtivoResponse | null> {
    const result = await pool.query(
      `DELETE FROM ativos WHERE ATV_ID = $1 
       RETURNING ATV_ID as "id", USR_ID as "usuarioId", ATV_NOME as "nome",
       ATV_DESCRICAO as "descricao", ATV_CREATED_AT as "criadoEm"`,
      [id]
    );
    return result.rows[0] || null;
  }
}