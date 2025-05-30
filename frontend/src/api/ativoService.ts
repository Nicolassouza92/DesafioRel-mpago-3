// import { IAtivoCreate } from '../../../backend/src/interfaces/ativo.interface'; // Ajuste o caminho se necessário
import type { IAtivoResponse } from '../../../backend/src/interfaces/ativo.interface';
import type { IAtivoUpdate } from '../../../backend/src/interfaces/ativo.interface'

// Reutilizar a URL base e a função fetchApi (pode-se até movê-las para um arquivo utilitário de API)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Adicionar 'credentials: "include"' para garantir que os cookies sejam enviados
  const defaultOptions: RequestInit = {
    credentials: 'include', // Essencial para enviar cookies (como o token JWT)
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    // Tenta pegar a mensagem de erro do corpo da resposta
    let errorData = { erro: `HTTP error! status: ${response.status}` };
    try {
      errorData = await response.json();
    } catch {
      // Ignora se o corpo não for JSON válido
    }
    throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json();
}

// Tipagem para o payload de criação (vindo do formulário, sem usuarioId)
export interface IAtivoFormData {
  nome: string;
  descricao?: string;
}


export const listarAtivos = async (): Promise<IAtivoResponse[]> => {
  return fetchApi<IAtivoResponse[]>(`${API_BASE_URL}/ativos`, {
    method: 'GET',
  });
};

export const criarAtivo = async (dadosAtivo: IAtivoFormData): Promise<IAtivoResponse> => {
  // O backend irá adicionar o usuarioId a partir do token JWT
  return fetchApi<IAtivoResponse>(`${API_BASE_URL}/ativos`, {
    method: 'POST',
    body: JSON.stringify(dadosAtivo),
  });
};

export const atualizarAtivo = async (id: number, dadosAtivo: Partial<IAtivoUpdate>): Promise<IAtivoResponse> => {
  return fetchApi<IAtivoResponse>(`${API_BASE_URL}/ativos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dadosAtivo),
  });
};

export const deletarAtivo = async (id: number): Promise<IAtivoResponse> => { // Ou Promise<void> se não retornar nada
  return fetchApi<IAtivoResponse>(`${API_BASE_URL}/ativos/${id}`, {
    method: 'DELETE',
  });
};