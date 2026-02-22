import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { api, saveSession, Session } from '../lib/api';

export function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('Entrando...');

    try {
      const session = await api<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password })
      });
      saveSession(session);
      navigate('/panel');
    } catch (error) {
      const parsed = error as { message?: string };
      setMessage(parsed.message ?? 'Falha no login');
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Entre com email/username e senha."
      bottomLabel="Não tem conta?"
      bottomLinkTo="/register"
      bottomLinkText="Criar conta"
    >
      <form onSubmit={onSubmit}>
        <input value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="name@work-email.com" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" type="password" />
        <button type="submit">Continue with Email</button>
      </form>
      <div className="auth-message">{message}</div>
    </AuthLayout>
  );
}
