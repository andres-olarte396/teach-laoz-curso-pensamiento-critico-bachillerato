import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)]">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded-2xl shadow-2xl border border-[var(--border-color)]">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Teach LAOZ" className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-black mb-6 text-center text-[var(--text-main)]">Iniciar Sesión</h2>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[var(--text-muted)] mb-2 text-sm font-bold uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-[var(--text-muted)] mb-2 text-sm font-bold uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-4 rounded-xl hover:bg-primary/90 font-bold transition-all shadow-lg hover:shadow-primary/30">
            Entrar
          </button>
        </form>
        <p className="mt-8 text-center text-[var(--text-muted)] text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};
