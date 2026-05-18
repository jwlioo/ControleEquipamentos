import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { equipamentosApi } from '../api/equipamentos.api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatarData, statusOptions } from '../utils/formatters';
import { StatusEquipamento } from '../types';
import type { Equipamento, FiltrosEquipamento } from '../types';
import {
  PlusCircle, Search, Filter, RefreshCw,
  Eye, Pencil, Trash2, ArrowLeftRight, Activity,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function Equipamentos() {
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filtros, setFiltros] = useState<FiltrosEquipamento>({});
  const [filtroTemp, setFiltroTemp] = useState({ Tipo: '', Responsavel: '', Status: '' });

  // Modal estados
  const [deleteTarget, setDeleteTarget] = useState<Equipamento | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusModal, setStatusModal] = useState<Equipamento | null>(null);
  const [novoStatus, setNovoStatus] = useState<StatusEquipamento | ''>('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [responsavelModal, setResponsavelModal] = useState<Equipamento | null>(null);
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [responsavelLoading, setResponsavelLoading] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params: FiltrosEquipamento = { ...filtros, Page: page, PageSize: PAGE_SIZE };
      const res = await equipamentosApi.listar(params);
      if (Array.isArray(res)) {
        setEquipamentos(res);
        setTotal(res.length >= PAGE_SIZE ? page * PAGE_SIZE + 1 : (page - 1) * PAGE_SIZE + res.length);
      } else {
        const paged = res as any;
        setEquipamentos(paged.items ?? []);
        setTotal(paged.total ?? 0);
      }
    } catch {
      setEquipamentos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => { carregar(); }, [carregar]);

  const aplicarFiltros = () => {
    setFiltros({
      Tipo: filtroTemp.Tipo || undefined,
      Responsavel: filtroTemp.Responsavel || undefined,
      Status: filtroTemp.Status ? Number(filtroTemp.Status) as StatusEquipamento : undefined,
    });
    setPage(1);
  };

  const limparFiltros = () => {
    setFiltroTemp({ Tipo: '', Responsavel: '', Status: '' });
    setFiltros({});
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await equipamentosApi.deletar(deleteTarget.id);
      setDeleteTarget(null);
      carregar();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModal || novoStatus === '') return;
    setStatusLoading(true);
    try {
      await equipamentosApi.atualizarStatus(statusModal.id, { novoStatus: Number(novoStatus) as StatusEquipamento });
      setStatusModal(null);
      setNovoStatus('');
      carregar();
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResponsavelUpdate = async () => {
    if (!responsavelModal || !novoResponsavel.trim()) return;
    setResponsavelLoading(true);
    try {
      await equipamentosApi.transferirResponsavel(responsavelModal.id, { responsavel: novoResponsavel.trim() });
      setResponsavelModal(null);
      setNovoResponsavel('');
      carregar();
    } finally {
      setResponsavelLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-subtitle">Gerencie todos os equipamentos cadastrados</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-icon" onClick={carregar} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <Link to="/equipamentos/novo" className="btn btn-primary">
            <PlusCircle size={18} /> Novo Equipamento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-panel">
        <div className="filter-grid">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <input
              className="form-input"
              placeholder="Ex: Notebook, Impressora..."
              value={filtroTemp.Tipo}
              onChange={(e) => setFiltroTemp({ ...filtroTemp, Tipo: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Responsável</label>
            <input
              className="form-input"
              placeholder="Nome do responsável"
              value={filtroTemp.Responsavel}
              onChange={(e) => setFiltroTemp({ ...filtroTemp, Responsavel: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filtroTemp.Status}
              onChange={(e) => setFiltroTemp({ ...filtroTemp, Status: e.target.value })}
            >
              <option value="">Todos</option>
              {statusOptions().map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-ghost" onClick={limparFiltros}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={aplicarFiltros}>
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <RefreshCw size={28} className="spin text-accent" />
            <p>Carregando equipamentos...</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Próx. Manutenção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((eq) => (
                <tr key={eq.id}>
                  <td className="td-name">
                    <Link to={`/equipamentos/${eq.id}`} className="table-link">{eq.nome}</Link>
                    <span className="td-serial">{eq.numeroSerie}</span>
                  </td>
                  <td><span className="chip">{eq.tipo}</span></td>
                  <td>{eq.modelo}</td>
                  <td>{eq.responsavelAtual ?? '—'}</td>
                  <td><StatusBadge status={eq.status} /></td>
                  <td>{formatarData(eq.proximaManutencao)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn" title="Ver detalhes"
                        onClick={() => navigate(`/equipamentos/${eq.id}`)}
                      ><Eye size={16} /></button>
                      <button
                        className="action-btn" title="Editar"
                        onClick={() => navigate(`/equipamentos/${eq.id}/editar`)}
                      ><Pencil size={16} /></button>
                      <button
                        className="action-btn" title="Alterar status"
                        onClick={() => { setStatusModal(eq); setNovoStatus(eq.status); }}
                      ><Activity size={16} /></button>
                      <button
                        className="action-btn" title="Transferir responsável"
                        onClick={() => { setResponsavelModal(eq); setNovoResponsavel(eq.responsavelAtual ?? ''); }}
                      ><ArrowLeftRight size={16} /></button>
                      <button
                        className="action-btn action-btn-danger" title="Deletar"
                        onClick={() => setDeleteTarget(eq)}
                      ><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && equipamentos.length === 0 && (
          <div className="empty-state">
            <Filter size={48} className="empty-icon" />
            <p>Nenhum equipamento encontrado</p>
            <Link to="/equipamentos/novo" className="btn btn-primary btn-sm">Cadastrar equipamento</Link>
          </div>
        )}

        {/* Paginação */}
        {!loading && equipamentos.length > 0 && (
          <div className="pagination">
            <span className="pagination-info">Página {page}</span>
            <div className="pagination-controls">
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              ><ChevronLeft size={18} /></button>
              <span className="pagination-page">{page}</span>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setPage((p) => p + 1)}
                disabled={equipamentos.length < PAGE_SIZE}
              ><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Alterar Status */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Alterar Status" size="sm">
        <div className="form-group">
          <label className="form-label">Novo Status para <strong>{statusModal?.nome}</strong></label>
          <select
            className="form-input"
            value={novoStatus}
            onChange={(e) => setNovoStatus(Number(e.target.value) as StatusEquipamento)}
          >
            {statusOptions().map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setStatusModal(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={statusLoading}>
            {statusLoading ? <span className="spinner-sm" /> : 'Salvar'}
          </button>
        </div>
      </Modal>

      {/* Modal: Transferir Responsável */}
      <Modal isOpen={!!responsavelModal} onClose={() => setResponsavelModal(null)} title="Transferir Responsável" size="sm">
        <div className="form-group">
          <label className="form-label">Novo Responsável por <strong>{responsavelModal?.nome}</strong></label>
          <input
            className="form-input"
            placeholder="Nome do novo responsável"
            value={novoResponsavel}
            onChange={(e) => setNovoResponsavel(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setResponsavelModal(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleResponsavelUpdate} disabled={responsavelLoading}>
            {responsavelLoading ? <span className="spinner-sm" /> : 'Transferir'}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deletar Equipamento"
        message={`Tem certeza que deseja deletar "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        loading={deleteLoading}
      />
    </div>
  );
}
