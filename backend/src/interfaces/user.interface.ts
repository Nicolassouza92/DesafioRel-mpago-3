export interface IUser {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export interface IUserCreate {
  nome: string;
  email: string;
  senha: string;
}

export interface IUserUpdate {
  nome?: string;
  email?: string;
  senha?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

export interface IUserResponse {
  id: number;
  nome: string;
  email: string;
}
