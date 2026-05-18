import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equipamentosApi } from '../api/equipamentos.api';
import { StatusBadge } from '../components/StatusBadge';
import { formatarData } from '../utils/formatters';
import { StatusEquipamento } from '../types';
import type { Equipamento } from '../types';
import {
  Monitor,
  CheckCircle2,
  Wrench,
  XCircle,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [garantias, setGarantias] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const [eq, gar] = await Promise.all([
        equipamentosApi.listar({ PageSize: 200 }),
        equipamentosApi.garantiaExpirando(),
      ]);
      setEquipamentos(Array.isArray(eq) ? eq : (eq as any)?.items ?? []);
      setGarantias(Array.isArray(gar) ? gar : (gar as any)?.items ?? []);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const total = equipamentos.length;
  const ativos = equipamentos.filter((e) => e.status === StatusEquipamento.Ativo).length;
  const manutencao = equipamentos.filter((e) => e.status === StatusEquipamento.EmManutencao).length;
  const inativos = equipamentos.filter(
    (e) => e.status === StatusEquipamento.Inativo || e.status === StatusEquipamento.Desativado
  ).length;

  const stats = [
    { label: 'Total', value: total, icon: Monitor, color: 'stat-blue' },
    { label: 'Ativos', value: ativos, icon: CheckCircle2, color: 'stat-green' },
    { label: 'Em Manutenção', value: manutencao, icon: Wrench, color: 'stat-yellow' },
    { label: 'Inativos', value: inativos, icon: XCircle, color: 'stat-red' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do controle de equipamentos</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-icon" onClick={carregar} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <Link to="/equipamentos/novo" className="btn btn-primary">
            <PlusCircle size={18} />
            Novo Equipamento
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">
              <s.icon size={24} />
            </div>
            <div className="stat-info">
              {loading ? (
                <div className="skeleton skeleton-number" />
              ) : (
                <span className="stat-value">{s.value}</span>
              )}
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Garantias expirando */}
      <div className="section">
        <div className="section-header">
          <div className="section-title-group">
            <AlertTriangle size={20} className="text-warning" />
            <h2 className="section-title">Garantias Expirando</h2>
            {garantias.length > 0 && (
              <span className="badge badge-warning">{garantias.length}</span>
            )}
          </div>
          <Link to="/garantias" className="btn btn-ghost btn-sm">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="card-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : garantias.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={48} className="empty-icon" />
            <p>Nenhum equipamento com garantia expirando nos próximos dias</p>
          </div>
        ) : (
          <div className="card-grid">
            {garantias.slice(0, 6).map((eq) => (
              <Link key={eq.id} to={`/equipamentos/${eq.id}`} className="eq-card-mini">
                <div className="eq-card-mini-header">
                  <span className="eq-nome">{eq.nome}</span>
                  <StatusBadge status={eq.status} />
                </div>
                <div className="eq-card-mini-body">
                  <span className="eq-tipo">{eq.tipo}</span>
                  <span className="eq-garantia text-warning">
                    <AlertTriangle size={13} />
                    Até {formatarData(eq.dataGarantiaExpiracao)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Últimos equipamentos */}
      <div className="section">
        <div className="section-header">
          <div className="section-title-group">
            <Monitor size={20} />
            <h2 className="section-title">Equipamentos Recentes</h2>
          </div>
          <Link to="/equipamentos" className="btn btn-ghost btn-sm">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="table-skeleton" />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Próx. Manutenção</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.slice(0, 5).map((eq) => (
                  <tr key={eq.id} className="table-row-link">
                    <td>
                      <Link to={`/equipamentos/${eq.id}`} className="table-link">
                        {eq.nome}
                      </Link>
                    </td>
                    <td><span className="chip">{eq.tipo}</span></td>
                    <td>{eq.responsavelAtual ?? '—'}</td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td>{formatarData(eq.proximaManutencao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {equipamentos.length === 0 && (
              <div className="empty-state">
                <Monitor size={48} className="empty-icon" />
                <p>Nenhum equipamento cadastrado</p>
                <Link to="/equipamentos/novo" className="btn btn-primary btn-sm">
                  Cadastrar primeiro equipamento
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
