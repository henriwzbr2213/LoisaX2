import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getUser } from '../lib/api';

type ConsoleCredentials = { data: { token: string; socket: string } };

type Server = {
  featherIdentifier: string;
  status: string;
  memory: number;
  disk: number;
  cpu: number;
};

export function ConsolePage() {
  const navigate = useNavigate();
  const { identifier = '' } = useParams();
  const user = getUser();
  const prefix = user?.role === 'admin' ? '/admin' : '/client';
  const [lines, setLines] = useState<string[]>([]);
  const [state, setState] = useState<'offline' | 'online' | 'error'>('offline');
  const [command, setCommand] = useState('');
  const [server, setServer] = useState<Server | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  function append(line: string) {
    setLines((prev) => [...prev.slice(-300), line]);
  }

  async function sendPower(signal: 'start' | 'restart' | 'stop') {
    await api(`${prefix}/servers/${identifier}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal })
    });
    append(`[power] ${signal}`);
  }

  function sendCommand() {
    if (!command.trim()) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ event: 'send command', args: [command.trim()] }));
    append(`> ${command.trim()}`);
    setCommand('');
  }

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        const servers = await api<Server[]>(`${prefix}/servers`);
        if (!mounted) return;
        setServer(servers.find((item) => item.featherIdentifier === identifier) ?? null);

        const creds = await api<ConsoleCredentials>(`${prefix}/servers/${identifier}/console`);
        const ws = new WebSocket(creds.data.socket);
        wsRef.current = ws;

        ws.onopen = () => {
          setState('online');
          ws.send(JSON.stringify({ event: 'auth', args: [creds.data.token] }));
          append('[ws] conectado');
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data as string) as { event?: string; args?: string[] };
            if (payload.event === 'console output' && Array.isArray(payload.args)) {
              payload.args.forEach(append);
              return;
            }
            if (payload.event === 'status' && Array.isArray(payload.args) && payload.args[0] && mounted) {
              setServer((prev) => (prev ? { ...prev, status: payload.args![0] } : prev));
              append(`[status] ${payload.args[0]}`);
            }
          } catch {
            append(String(event.data));
          }
        };

        ws.onerror = () => {
          setState('error');
        };

        ws.onclose = () => {
          setState('offline');
          append('[ws] desconectado');
        };
      } catch {
        setState('error');
      }
    }

    boot();
    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, [identifier]);

  const wsLabel = useMemo(() => (state === 'online' ? 'online' : state === 'error' ? 'erro' : 'offline'), [state]);

  return (
    <div className="console-wrap">
      <div className="crumb">Dashboard &gt; Servers &gt; {identifier} &gt; Console</div>
      <div className="console-top">
        <h1>{identifier}</h1>
        <div className="row">
          <button onClick={() => sendPower('start')}>Start</button>
          <button onClick={() => sendPower('restart')}>Restart</button>
          <button onClick={() => sendPower('stop')}>Stop</button>
          <button onClick={() => navigate('/panel')}>Voltar</button>
        </div>
      </div>
      <div className="row muted">
        <span>WS: {wsLabel}</span>
        <span>Status: {server?.status ?? '-'}</span>
        <span>Memory: {server?.memory ?? 0} MB</span>
        <span>Disk: {server?.disk ?? 0} MB</span>
        <span>CPU: {server?.cpu ?? 0}%</span>
      </div>
      <pre className="console-log">{lines.join('\n')}</pre>
      <div className="row">
        <input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendCommand()} placeholder="Digite comando" />
        <button onClick={sendCommand}>Enviar</button>
      </div>
    </div>
  );
}
