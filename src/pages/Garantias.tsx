import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equipamentosApi } from '../api/equipamentos.api';
import { StatusBadge } from '../components/StatusBadge';
import { formatarData } from '../utils/formatters';
import type { Equipamento } from '../types';
import { AlertTriangle, RefreshCw, Shield, Calendar } from 'lucide-react';

export default function Garantias() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await equipamentosApi.garantiaExpirando();
      setEquipamentos(Array.isArray(res) ? res : (res as any)?.items ?? []);
    } catch {
      setEquipamentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Garantias Expirando</h1>
          <p className="page-subtitle">Equipamentos com garantia próxima do vencimento</p>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={carregar} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="loading-center">
          <RefreshCw size={32} className="spin text-accent" />
          <p>Carregando...</p>
        </div>
      ) : equipamentos.length === 0 ? (
        <div className="empty-state empty-state-lg">
          <Shield size={64} className="empty-icon text-success" />
          <h2>Tudo certo!</h2>
          <p>Nenhum equipamento com garantia expirando nos próximos dias.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Fabricante</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Garantia até</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((eq) => {
                const exp = eq.dataGarantiaExpiracao ? new Date(eq.dataGarantiaExpiracao) : null;
                const diff = exp ? Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                const isExpired = diff !== null && diff < 0;
                return (
                  <tr key={eq.id}>
                    <td>
                      <Link to={`/equipamentos/${eq.id}`} className="table-link">{eq.nome}</Link>
                    </td>
                    <td><span className="chip">{eq.tipo}</span></td>
                    <td>{eq.fabricante}</td>
                    <td>{eq.responsavelAtual ?? '—'}</td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td>
                      <div className={`garantia-cell ${isExpired ? 'garantia-expirada' : 'garantia-alerta'}`}>
                        {isExpired ? (
                          <><AlertTriangle size={14} /> Expirada ({formatarData(eq.dataGarantiaExpiracao)})</>
                        ) : (
                          <><Calendar size={14} /> {formatarData(eq.dataGarantiaExpiracao)} ({diff}d)</>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link to={`/equipamentos/${eq.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
