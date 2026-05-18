import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { equipamentosApi } from '../api/equipamentos.api';
import { toInputDate } from '../utils/formatters';
import { ArrowLeft, Save } from 'lucide-react';

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  tipo: z.string().min(1, 'Tipo obrigatório'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  fabricante: z.string().min(1, 'Fabricante obrigatório'),
  numeroSerie: z.string().optional(),
  responsavelAtual: z.string().optional(),
  dataAquisicao: z.string().optional(),
  dataGarantiaExpiracao: z.string().optional(),
  proximaManutencao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EquipamentoForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [initLoading, setInitLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isEdit) return;
    equipamentosApi.buscarPorId(id!).then((eq) => {
      reset({
        nome: eq.nome,
        tipo: eq.tipo,
        modelo: eq.modelo,
        fabricante: eq.fabricante,
        numeroSerie: eq.numeroSerie,
        responsavelAtual: eq.responsavelAtual ?? '',
        dataAquisicao: toInputDate(eq.dataAquisicao),
        dataGarantiaExpiracao: toInputDate(eq.dataGarantiaExpiracao),
        proximaManutencao: toInputDate(eq.proximaManutencao),
      });
      setInitLoading(false);
    }).catch(() => navigate('/equipamentos'));
  }, [id]);

  const toISO = (val?: string) => {
    if (!val) return undefined;
    return new Date(val).toISOString();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError('');
    try {
      if (isEdit) {
        await equipamentosApi.atualizar(id!, {
          nome: data.nome,
          tipo: data.tipo,
          modelo: data.modelo,
          fabricante: data.fabricante,
          responsavelAtual: data.responsavelAtual || null,
          dataAquisicao: toISO(data.dataAquisicao) ?? new Date().toISOString(),
          dataGarantiaExpiracao: toISO(data.dataGarantiaExpiracao),
          proximaManutencao: toISO(data.proximaManutencao),
        });
        navigate(`/equipamentos/${id}`);
      } else {
        const eq = await equipamentosApi.criar({
          nome: data.nome,
          tipo: data.tipo,
          modelo: data.modelo,
          fabricante: data.fabricante,
          numeroSerie: data.numeroSerie ?? '',
          responsavelAtual: data.responsavelAtual || null,
          dataAquisicao: toISO(data.dataAquisicao) ?? new Date().toISOString(),
          dataGarantiaExpiracao: toISO(data.dataGarantiaExpiracao),
          proximaManutencao: toISO(data.proximaManutencao),
        });
        navigate(`/equipamentos/${eq?.id ?? ''}`);
      }
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data) ||
        'Erro ao salvar equipamento.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}</h1>
            <p className="page-subtitle">{isEdit ? 'Atualize as informações do equipamento' : 'Preencha os dados para cadastrar'}</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="alert alert-error mb-4">
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form-card">
        <div className="form-section">
          <h2 className="form-section-title">Identificação</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nome <span className="required">*</span></label>
              <input className={`form-input ${errors.nome ? 'input-error' : ''}`} placeholder="Nome do equipamento" {...register('nome')} />
              {errors.nome && <span className="form-error">{errors.nome.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Tipo <span className="required">*</span></label>
              <input className={`form-input ${errors.tipo ? 'input-error' : ''}`} placeholder="Ex: Notebook, Impressora" {...register('tipo')} />
              {errors.tipo && <span className="form-error">{errors.tipo.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Modelo <span className="required">*</span></label>
              <input className={`form-input ${errors.modelo ? 'input-error' : ''}`} placeholder="Modelo do equipamento" {...register('modelo')} />
              {errors.modelo && <span className="form-error">{errors.modelo.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Fabricante <span className="required">*</span></label>
              <input className={`form-input ${errors.fabricante ? 'input-error' : ''}`} placeholder="Fabricante" {...register('fabricante')} />
              {errors.fabricante && <span className="form-error">{errors.fabricante.message}</span>}
            </div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Número de Série <span className="required">*</span></label>
                <input className={`form-input ${errors.numeroSerie ? 'input-error' : ''}`} placeholder="SN-000000" {...register('numeroSerie')} />
                {errors.numeroSerie && <span className="form-error">{errors.numeroSerie.message}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Responsável</label>
              <input className="form-input" placeholder="Nome do responsável" {...register('responsavelAtual')} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Datas</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Data de Aquisição</label>
              <input type="date" className="form-input" {...register('dataAquisicao')} />
            </div>

            <div className="form-group">
              <label className="form-label">Expiração da Garantia</label>
              <input type="date" className="form-input" {...register('dataGarantiaExpiracao')} />
            </div>

            <div className="form-group">
              <label className="form-label">Próxima Manutenção</label>
              <input type="date" className="form-input" {...register('proximaManutencao')} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : (
              <>
                <Save size={18} />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
