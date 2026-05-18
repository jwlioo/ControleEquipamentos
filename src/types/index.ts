// ─── Enums ────────────────────────────────────────────────────────────────────
export enum StatusEquipamento {
  Ativo = 1,
  EmManutencao = 2,
  Inativo = 3,
  Desativado = 4,
}

export const StatusEquipamentoLabel: Record<StatusEquipamento, string> = {
  [StatusEquipamento.Ativo]: 'Ativo',
  [StatusEquipamento.EmManutencao]: 'Em Manutenção',
  [StatusEquipamento.Inativo]: 'Inativo',
  [StatusEquipamento.Desativado]: 'Desativado',
};

export const StatusEquipamentoColor: Record<StatusEquipamento, string> = {
  [StatusEquipamento.Ativo]: 'status-ativo',
  [StatusEquipamento.EmManutencao]: 'status-manutencao',
  [StatusEquipamento.Inativo]: 'status-inativo',
  [StatusEquipamento.Desativado]: 'status-desativado',
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  expiracao?: string;
  usuario?: string;
}

// ─── Equipamento ──────────────────────────────────────────────────────────────
export interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  modelo: string;
  fabricante: string;
  numeroSerie: string;
  responsavelAtual?: string | null;
  dataAquisicao: string;
  dataGarantiaExpiracao?: string | null;
  proximaManutencao?: string | null;
  status: StatusEquipamento;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CriarEquipamentoRequest {
  nome: string;
  tipo: string;
  modelo: string;
  fabricante: string;
  numeroSerie: string;
  responsavelAtual?: string | null;
  dataAquisicao: string;
  dataGarantiaExpiracao?: string | null;
  proximaManutencao?: string | null;
}

export interface AtualizarEquipamentoRequest {
  nome: string;
  tipo: string;
  modelo: string;
  fabricante: string;
  responsavelAtual?: string | null;
  dataAquisicao: string;
  dataGarantiaExpiracao?: string | null;
  proximaManutencao?: string | null;
}

export interface AtualizarStatusRequest {
  novoStatus: StatusEquipamento;
}

export interface TransferirResponsavelRequest {
  responsavel: string;
}

// ─── Filtros / Paginação ──────────────────────────────────────────────────────
export interface FiltrosEquipamento {
  Tipo?: string;
  Status?: StatusEquipamento;
  Responsavel?: string;
  Page?: number;
  PageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Histórico ────────────────────────────────────────────────────────────────
export interface HistoricoItem {
  id?: string;
  equipamentoId?: string;
  campo?: string;
  valorAnterior?: string;
  valorNovo?: string;
  alteradoPor?: string;
  dataAlteracao?: string;
  tipo?: string;
  descricao?: string;
}
