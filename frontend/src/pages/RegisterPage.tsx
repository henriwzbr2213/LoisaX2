import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { api, saveSession, Session } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('Criando conta...');

    try {
      const session = await api<Session>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      saveSession(session);
      navigate('/panel');
    } catch (error) {
      const parsed = error as { message?: string };
      setMessage(parsed.message ?? 'Falha no cadastro');
    }
  }

  return (
    <AuthLayout
      title="Cadastro"
      subtitle="Primeira conta registrada vira admin, as demais client."
      bottomLabel="Já tem conta?"
      bottomLinkTo="/login"
      bottomLinkText="Entrar"
    >
      <form onSubmit={onSubmit}>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@work-email.com" />
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />
        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Nome" />
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Sobrenome" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Senha" type="password" />
        <button type="submit">Create account</button>
      </form>
      <div className="auth-message">{message}</div>
    </AuthLayout>
  );
}
