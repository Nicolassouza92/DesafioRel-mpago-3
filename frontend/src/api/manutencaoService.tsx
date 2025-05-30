import type {  
  IManutencaoResponse, 
  IManutencaoUpdate,
  IManutencaoPendentePainel 
} from '../../../backend/src/interfaces/manutencao.interface'; // Ajuste o caminho

// Reutilizar a URL base e a função fetchApi (idealmente, mova fetchApi para um utils/api.ts)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  const response = await fetch(url, defaultOptions);
  if (!response.ok) {
    let errorData = { erro: `HTTP error! status: ${response.status}` };
    try { errorData = await response.json(); } catch { /* ignora */ }
    throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json();
}

// Interface para dados do formulário de criação de manutenção
export interface IManutencaoFormData {
  ativoId: number; // Necessário para associar a manutenção ao ativo correto
  descricaoServico: string;
  descricaoDetalhada?: string;
  dataExecucao: string; // Enviar como string YYYY-MM-DD
  proximaData?: string | null; // Enviar como string YYYY-MM-DD ou null
}


export const criarManutencao = async (dadosManutencao: IManutencaoFormData): Promise<IManutencaoResponse> => {
  return fetchApi<IManutencaoResponse>(`${API_BASE_URL}/manutencoes`, {
    method: 'POST',
    body: JSON.stringify(dadosManutencao),
  });
};

export const listarManutencoesPorAtivo = async (ativoId: number): Promise<IManutencaoResponse[]> => {
  console.warn('Função listarManutencoesPorAtivo ainda não implementada com rota específica no backend.');
  return fetchApi<IManutencaoResponse[]>(`${API_BASE_URL}/manutencoes/historico`, { // Usando histórico geral por enquanto
    method: 'GET',
  }).then(manutencoes => manutencoes.filter(m => m.ativoId === ativoId));
};

export const listarManutencoesPendentes = async (): Promise<IManutencaoPendentePainel[]> => {
  return fetchApi<IManutencaoPendentePainel[]>(`${API_BASE_URL}/manutencoes/pendentes`, {
    method: 'GET',
  });
};

export const listarHistoricoManutencoes = async (): Promise<IManutencaoResponse[]> => {
  return fetchApi<IManutencaoResponse[]>(`${API_BASE_URL}/manutencoes/historico`, {
    method: 'GET',
  });
};

export const atualizarManutencao = async (id: number, dadosManutencao: Partial<IManutencaoUpdate>): Promise<IManutencaoResponse> => {
  return fetchApi<IManutencaoResponse>(`${API_BASE_URL}/manutencoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dadosManutencao),
  });
};

export const deletarManutencao = async (id: number): Promise<IManutencaoResponse> => {
  return fetchApi<IManutencaoResponse>(`${API_BASE_URL}/manutencoes/${id}`, {
    method: 'DELETE',
  });
};