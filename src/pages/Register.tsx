import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Settings, UserPlus, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await registerUser({ nome: data.nome, email: data.email, senha: data.senha });
      navigate('/login', { state: { message: 'Conta criada! Faça o login.' } });
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data ||
        'Erro ao criar conta. Tente novamente.'
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <Settings size={32} className="auth-logo-icon" />
          <span className="auth-logo-text">ControleEQ</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Preencha os dados para se cadastrar no sistema</p>
        </div>

        {apiError && (
          <div className="alert alert-error">
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              id="register-nome"
              type="text"
              className={`form-input ${errors.nome ? 'input-error' : ''}`}
              placeholder="Seu nome completo"
              {...register('nome')}
            />
            {errors.nome && <span className="form-error">{errors.nome.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              id="register-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-wrapper">
              <input
                id="register-senha"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.senha ? 'input-error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                {...register('senha')}
              />
              <button
                type="button"
                className="input-addon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.senha && <span className="form-error">{errors.senha.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Senha</label>
            <input
              id="register-confirmar-senha"
              type="password"
              className={`form-input ${errors.confirmarSenha ? 'input-error' : ''}`}
              placeholder="Repita a senha"
              {...register('confirmarSenha')}
            />
            {errors.confirmarSenha && (
              <span className="form-error">{errors.confirmarSenha.message}</span>
            )}
          </div>

          <button id="btn-register" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : (
              <>
                <UserPlus size={18} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
