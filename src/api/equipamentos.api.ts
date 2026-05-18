import api from './axios';
import type {
  Equipamento,
  CriarEquipamentoRequest,
  AtualizarEquipamentoRequest,
  AtualizarStatusRequest,
  TransferirResponsavelRequest,
  FiltrosEquipamento,
  HistoricoItem,
} from '../types';

export const equipamentosApi = {
  listar: async (filtros?: FiltrosEquipamento): Promise<Equipamento[]> => {
    const res = await api.get<Equipamento[]>('/api/Equipamentos', { params: filtros });
    return res.data;
  },

  buscarPorId: async (id: string): Promise<Equipamento> => {
    const res = await api.get<Equipamento>(`/api/Equipamentos/${id}`);
    return res.data;
  },

  criar: async (data: CriarEquipamentoRequest): Promise<Equipamento> => {
    const res = await api.post<Equipamento>('/api/Equipamentos', data);
    return res.data;
  },

  atualizar: async (id: string, data: AtualizarEquipamentoRequest): Promise<Equipamento> => {
    const res = await api.put<Equipamento>(`/api/Equipamentos/${id}`, data);
    return res.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/Equipamentos/${id}`);
  },

  atualizarStatus: async (id: string, data: AtualizarStatusRequest): Promise<void> => {
    await api.patch(`/api/Equipamentos/${id}/status`, data);
  },

  transferirResponsavel: async (id: string, data: TransferirResponsavelRequest): Promise<void> => {
    await api.patch(`/api/Equipamentos/${id}/responsavel`, data);
  },

  garantiaExpirando: async (): Promise<Equipamento[]> => {
    const res = await api.get<Equipamento[]>('/api/Equipamentos/garantia-expirando');
    return res.data;
  },

  historico: async (id: string): Promise<HistoricoItem[]> => {
    const res = await api.get<HistoricoItem[]>(`/api/Equipamentos/${id}/historico`);
    return res.data;
  },
};
