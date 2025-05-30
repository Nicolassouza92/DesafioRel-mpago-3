// Idealmente, a URL base da API viria de uma variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface UserResponse {
  id: number;
  nome: string;
  email: string;
  // Outros campos que o backend retorna, exceto a senha
}

// Função auxiliar para requisições
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include', // <--- GARANTA QUE ESTA LINHA ESTEJA AQUI TAMBÉM!
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
  // Para logout ou outras chamadas que podem não retornar JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T; // Ou um objeto de sucesso específico se preferir
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
  // Assumindo que o backend ao registrar já retorna o usuário e seta o cookie (login automático)
  return fetchApi<UserResponse>(`${API_BASE_URL}/usuarios/registrar`, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });
};

export const logout = async (): Promise<void> => {
  // O logout limpa o cookie httpOnly no backend.
  // O método fetchApi pode precisar de ajuste se o backend não retornar JSON no logout (ex: status 200/204 sem corpo)
  await fetchApi<void>(`${API_BASE_URL}/usuarios/logout`, {
    method: 'POST', // Ou GET, dependendo da sua implementação no backend
  });
};

export const getProfile = async (): Promise<UserResponse> => {
  // Esta chamada usa o cookie httpOnly automaticamente enviado pelo navegador
  return fetchApi<UserResponse>(`${API_BASE_URL}/usuarios/perfil`, {
    method: 'GET',
  });
};