const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface UserResponse {
  id: number;
  nome: string;
  email: string;
  
}


async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });


  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ erro: 'Erro desconhecido na resposta da API' }));
    throw new Error(errorData.erro || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json();
}


export const login = async (email: string, senha: string): Promise<UserResponse> => {
  return fetchApi<UserResponse>(`${API_BASE_URL}/usuarios/login`, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
};

export const register = async (nome: string, email: string, senha: string): Promise<UserResponse> => {
  return fetchApi<UserResponse>(`${API_BASE_URL}/usuarios/registrar`, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });
};

export const logout = async (): Promise<void> => {
  await fetchApi<void>(`${API_BASE_URL}/usuarios/logout`, {
    method: 'POST',
  });
};

export const getProfile = async (): Promise<UserResponse> => {
  return fetchApi<UserResponse>(`${API_BASE_URL}/usuarios/perfil`, {
    method: 'GET',
  });
};