/** Registro genérico de configuração (chave/valor), extensível a novas chaves sem mudança de schema. */
export interface ISiteSetting {
  id: number;
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface IMaintenanceModeValue {
  enabled: boolean;
}
