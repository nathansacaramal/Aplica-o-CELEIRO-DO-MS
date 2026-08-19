export interface FindClienteByTelefoneRepository {
  findByTelefone(
    telefone: string,
  ): Promise<{ userId: number; name?: string; endereco?: string; telefone?: string } | null>;
}
