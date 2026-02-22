import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearSession, getUser } from '../lib/api';

type Server = {
  id: string;
  featherIdentifier: string;
  nodeId: number;
  eggId: number;
  status: string;
  memory: number;
  disk: number;
  cpu: number;
};

export function PanelPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState('');

  const prefix = user?.role === 'admin' ? '/admin' : '/client';

  async function loadServers() {
    const items = await api<Server[]>(`${prefix}/servers`);
    setServers(items);
  }

  useEffect(() => {
    loadServers().catch(() => setServers([]));
  }, []);

  const filtered = useMemo(
    () => servers.filter((server) => server.featherIdentifier.toLowerCase().includes(search.toLowerCase())),
    [servers, search]
  );

  return (
    <div className="dash-wrap">
      <header className="dash-top">
        <h1>Dashboard</h1>
        <div>
          <span>{user?.username} ({user?.role})</span>
          <button
            onClick={() => {
              clearSession();
              navigate('/login');
            }}
          >
            Sair
          </button>
        </div>
      </header>
      <div className="dash-toolbar">
        <button onClick={() => loadServers()}>Refresh</button>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search servers..." />
      </div>
      <section className="server-grid">
        {filtered.map((server) => (
          <article key={server.id} className="server-card" onClick={() => navigate(`/console/${server.featherIdentifier}`)}>
            <h3>{server.featherIdentifier}</h3>
            <p>Status: {server.status}</p>
            <p>Node: {server.nodeId} | Egg: {server.eggId}</p>
            <div className="stats">
              <span>Memory {server.memory} MB</span>
              <span>Disk {server.disk} MB</span>
              <span>CPU {server.cpu}%</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
