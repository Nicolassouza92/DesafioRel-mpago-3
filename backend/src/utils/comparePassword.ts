import bcrypt from 'bcrypt';

export async function comparePassword(senha: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(senha, hash);
  } catch (error) {
    throw new Error('Erro ao comparar senha');
  }
}