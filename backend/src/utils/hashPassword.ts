import bcrypt from 'bcrypt';

export async function hashPassword(senha: string): Promise<string> {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
  } catch (error) {
    throw new Error('Erro ao gerar hash da senha');
  }
}