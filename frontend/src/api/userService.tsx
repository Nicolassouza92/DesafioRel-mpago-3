import type { IUserResponse, IUserUpdate } from '../../../backend/src/interfaces/user.interface'; // Ajuste o caminho

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Reutilize ou crie uma função fetchApi similar à de authService e ativoService, COM 'credentials: "include"'
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


export const atualizarUsuario = async (id: number, dadosUpdate: IUserUpdate): Promise<IUserResponse> => {
  return fetchApi<IUserResponse>(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dadosUpdate),
  });
};

// Poderíamos adicionar getUsuario(id) se necessário, mas o perfil já vem do AuthContext.