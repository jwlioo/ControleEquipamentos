import { StatusEquipamento, StatusEquipamentoLabel } from '../types';

export function formatarData(data?: string | null): string {
  if (!data) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(data));
  } catch {
    return '—';
  }
}

export function formatarDataHora(data?: string | null): string {
  if (!data) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data));
  } catch {
    return '—';
  }
}

export function toInputDate(data?: string | null): string {
  if (!data) return '';
  try {
    return new Date(data).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function labelStatus(status: StatusEquipamento): string {
  return StatusEquipamentoLabel[status] ?? 'Desconhecido';
}

export function statusOptions() {
  return [
    { value: StatusEquipamento.Ativo, label: 'Ativo' },
    { value: StatusEquipamento.EmManutencao, label: 'Em Manutenção' },
    { value: StatusEquipamento.Inativo, label: 'Inativo' },
    { value: StatusEquipamento.Desativado, label: 'Desativado' },
  ];
}

export function garantiaStatus(dataExpiracao?: string | null): 'ok' | 'alerta' | 'expirada' | 'sem' {
  if (!dataExpiracao) return 'sem';
  const exp = new Date(dataExpiracao);
  const hoje = new Date();
  const diff = (exp.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'expirada';
  if (diff <= 30) return 'alerta';
  return 'ok';
}
