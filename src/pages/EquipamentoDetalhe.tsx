import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { equipamentosApi } from '../api/equipamentos.api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatarData, formatarDataHora, statusOptions } from '../utils/formatters';
import { StatusEquipamento } from '../types';
import type { Equipamento, HistoricoItem } from '../types';
import {
  ArrowLeft, Pencil, Trash2, Activity, ArrowLeftRight,
  Monitor, Calendar, Shield, Wrench, User, Hash,
  RefreshCw, Clock,
} from 'lucide-react';

export default function EquipamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eq, setEq] = useState<Equipamento | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusEquipamento | ''>('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [responsavelModal, setResponsavelModal] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [responsavelLoading, setResponsavelLoading] = useState(false);

  const carregar = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [equipamento, hist] = await Promise.all([
        equipamentosApi.buscarPorId(id),
        equipamentosApi.historico(id).catch(() => []),
      ]);
      setEq(equipamento);
      setHistorico(Array.isArray(hist) ? hist : []);
    } catch {
      navigate('/equipamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await equipamentosApi.deletar(id);
      navigate('/equipamentos');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatus = async () => {
    if (!id || novoStatus === '') return;
    setStatusLoading(true);
    try {
      await equipamentosApi.atualizarStatus(id, { novoStatus: Number(novoStatus) as StatusEquipamento });
      setStatusModal(false);
      carregar();
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResponsavel = async () => {
    if (!id || !novoResponsavel.trim()) return;
    setResponsavelLoading(true);
    try {
      await equipamentosApi.transferirResponsavel(id, { responsavel: novoResponsavel.trim() });
      setResponsavelModal(false);
      carregar();
    } finally {
      setResponsavelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <RefreshCw size={32} className="spin text-accent" />
          <p>Carregando equipamento...</p>
        </div>
      </div>
    );
  }

  if (!eq) return null;

  const fields = [
    { icon: Monitor, label: 'Nome', value: eq.nome },
    { icon: Hash, label: 'Número de Série', value: eq.numeroSerie },
    { icon: Monitor, label: 'Tipo', value: eq.tipo },
    { icon: Monitor, label: 'Modelo', value: eq.modelo },
    { icon: Monitor, label: 'Fabricante', value: eq.fabricante },
    { icon: User, label: 'Responsável', value: eq.responsavelAtual ?? '—' },
    { icon: Calendar, label: 'Data de Aquisição', value: formatarData(eq.dataAquisicao) },
    { icon: Shield, label: 'Garantia até', value: formatarData(eq.dataGarantiaExpiracao) },
    { icon: Wrench, label: 'Próxima Manutenção', value: formatarData(eq.proximaManutencao) },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/equipamentos')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{eq.nome}</h1>
            <p className="page-subtitle">{eq.tipo} · {eq.fabricante}</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => { setStatusModal(true); setNovoStatus(eq.status); }}>
            <Activity size={16} /> Status
          </button>
          <button className="btn btn-ghost" onClick={() => { setResponsavelModal(true); setNovoResponsavel(eq.responsavelAtual ?? ''); }}>
            <ArrowLeftRight size={16} /> Responsável
          </button>
          <Link to={`/equipamentos/${eq.id}/editar`} className="btn btn-secondary">
            <Pencil size={16} /> Editar
          </Link>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} /> Deletar
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Info card */}
        <div className="detail-card">
          <div className="detail-card-header">
            <Monitor size={18} />
            <h2>Informações do Equipamento</h2>
            <StatusBadge status={eq.status} />
          </div>
          <div className="detail-fields">
            {fields.map((f) => (
              <div key={f.label} className="detail-field">
                <div className="detail-field-label">
                  <f.icon size={14} />
                  <span>{f.label}</span>
                </div>
                <span className="detail-field-value">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="detail-card">
          <div className="detail-card-header">
            <Clock size={18} />
            <h2>Histórico de Alterações</h2>
          </div>
          {historico.length === 0 ? (
            <div className="empty-state empty-state-sm">
              <Clock size={32} className="empty-icon" />
              <p>Sem histórico registrado</p>
            </div>
          ) : (
            <div className="historico-list">
              {historico.map((h, i) => (
                <div key={h.id ?? i} className="historico-item">
                  <div className="historico-dot" />
                  <div className="historico-content">
                    <span className="historico-tipo">{h.tipo ?? h.campo ?? 'Alteração'}</span>
                    {h.descricao && <p className="historico-desc">{h.descricao}</p>}
                    {h.valorAnterior && (
                      <p className="historico-change">
                        <span className="change-old">{h.valorAnterior}</span>
                        <span> → </span>
                        <span className="change-new">{h.valorNovo}</span>
                      </p>
                    )}
                    <span className="historico-data">{formatarDataHora(h.dataAlteracao)}</span>
                    {h.alteradoPor && <span className="historico-autor">por {h.alteradoPor}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Alterar Status" size="sm">
        <div className="form-group">
          <label className="form-label">Novo Status</label>
          <select className="form-input" value={novoStatus} onChange={(e) => setNovoStatus(Number(e.target.value) as StatusEquipamento)}>
            {statusOptions().map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setStatusModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleStatus} disabled={statusLoading}>
            {statusLoading ? <span className="spinner-sm" /> : 'Salvar'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={responsavelModal} onClose={() => setResponsavelModal(false)} title="Transferir Responsável" size="sm">
        <div className="form-group">
          <label className="form-label">Novo Responsável</label>
          <input className="form-input" placeholder="Nome do responsável" value={novoResponsavel} onChange={(e) => setNovoResponsavel(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setResponsavelModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleResponsavel} disabled={responsavelLoading}>
            {responsavelLoading ? <span className="spinner-sm" /> : 'Transferir'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Deletar Equipamento"
        message={`Tem certeza que deseja deletar "${eq.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        loading={deleteLoading}
      />
    </div>
  );
}
