import pool from "../config/database";
import {
  IUser,
  IUserCreate,
  IUserResponse,
  IUserUpdate,
} from "../interfaces/user.interface";
import { hashPassword } from "../utils/hashPassword";

export class UserRepository {
  static async criar(user: IUserCreate): Promise<IUserResponse> {
    const senhaCriptografada = await hashPassword(user.senha);

    const result = await pool.query(
      "INSERT INTO usuarios (USR_NOME, USR_EMAIL, USR_SENHA) VALUES ($1, $2, $3) RETURNING USR_ID as id, USR_NOME as nome, USR_EMAIL as email",
      [user.nome, user.email, senhaCriptografada]
    );

    return result.rows[0];
  }

  static async buscarPorEmail(email: string): Promise<IUser | null> {
    const result = await pool.query(
      "SELECT USR_ID as id, USR_NOME as nome, USR_EMAIL as email, USR_SENHA as senha FROM usuarios WHERE USR_EMAIL = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  static async buscarPorId(id: number): Promise<IUser | null> {
    const result = await pool.query(
      "SELECT USR_ID as id, USR_NOME as nome, USR_EMAIL as email, USR_SENHA as senha FROM usuarios WHERE USR_ID = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async atualizar(
    id: number,
    dados: IUserUpdate
  ): Promise<IUserResponse | null> {
    let query = "UPDATE usuarios SET";
    const valores: any[] = [];
    let contador = 1;

    if (dados.nome) {
      query += ` USR_NOME = $${contador},`;
      valores.push(dados.nome);
      contador++;
    }
    if (dados.email) {
      query += ` USR_EMAIL = $${contador},`;
      valores.push(dados.email);
      contador++;
    }
    if (dados.senha) {
      const senhaCriptografada = await hashPassword(dados.senha);
      query += ` USR_SENHA = $${contador},`;
      valores.push(senhaCriptografada);
      contador++;
    }

    query = query.slice(0, -1);
    query += ` WHERE USR_ID = $${contador} RETURNING USR_ID as id, USR_NOME as nome, USR_EMAIL as email`;
    valores.push(id);

    const result = await pool.query(query, valores);
    return result.rows[0] || null;
  }

  static async deletar(id: number): Promise<IUserResponse | null> {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE USR_ID = $1 RETURNING USR_ID as id, USR_NOME as nome, USR_EMAIL as email",
      [id]
    );
    return result.rows[0] || null;
  }

  static async listarTodos(): Promise<IUserResponse[]> {
    const result = await pool.query(
      "SELECT USR_ID as id, USR_NOME as nome, USR_EMAIL as email FROM usuarios"
    );
    return result.rows;
  }
}
