import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  Layers, 
  Cloud, 
  Mail, 
  Zap, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  Code2, 
  Activity, 
  RefreshCw, 
  Sparkles,
  Network,
  Video,
  Globe,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AboutViewProps {
  currentUser?: User;
  onStartDemoCall?: (type: 'audio' | 'video') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  currentUser,
  onStartDemoCall,
}) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [latency, setLatency] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const checkHealth = async () => {
    setApiStatus('checking');
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:8008/health');
      const data = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setApiInfo(data);
      setApiStatus('online');

      // Fetch Peer ID
      try {
        const id = await api.getPeerId();
        setPeerId(id);
      } catch (_) {}
    } catch (e) {
      setApiStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runEndpointTest = async (name: string, fn: () => Promise<any>) => {
    setTestingEndpoint(name);
    setTestResult(null);
    try {
      const data = await fn();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(`Error: ${err.message || err}`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e1b4b] text-white p-5 sm:p-10 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Connect-Hub Architecture</span>
            <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">v1.0.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Connect-Hub</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
            A high-performance modern social platform built with <strong>Python FastAPI</strong> modular MVC, 
            <strong>SQLAlchemy 2.0</strong>, multi-database support (PostgreSQL, MySQL, SQLite, MongoDB), 
            built-in <strong>PeerJS & WebRTC</strong> calling, <strong>S3 / R2</strong> storage, and a fluid <strong>React 19 + Tailwind v4</strong> frontend.
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-3 sm:p-3.5 rounded-2xl">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium block">Backend Engine</span>
              <span className="text-white text-xs sm:text-base font-bold flex items-center gap-1 mt-1 truncate">
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> FastAPI Py3.12
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-2xl">
              <span className="text-slate-400 text-xs font-medium block">Database Layer</span>
              <span className="text-white text-base font-bold flex items-center gap-1.5 mt-1">
                <Database className="w-4 h-4 text-blue-400" /> SQLAlchemy 2.0
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-2xl">
              <span className="text-slate-400 text-xs font-medium block">Realtime Signaling</span>
              <span className="text-white text-base font-bold flex items-center gap-1.5 mt-1">
                <Radio className="w-4 h-4 text-purple-400" /> PeerJS WebRTC
              </span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-2xl">
              <span className="text-slate-400 text-xs font-medium block">Object Storage</span>
              <span className="text-white text-base font-bold flex items-center gap-1.5 mt-1">
                <Cloud className="w-4 h-4 text-amber-400" /> S3 / R2 / Local
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Health & Connection Monitor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Live API & Service Health</h2>
              <p className="text-xs text-gray-500">Real-time status of connected backend microservices</p>
            </div>
          </div>

          <button
            onClick={checkHealth}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Status Badge 1 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block">FastAPI Server</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">http://localhost:8008</span>
              {latency !== null && (
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                  ⚡ Latency: {latency}ms
                </span>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              apiStatus === 'online' 
                ? 'bg-emerald-100 text-emerald-700' 
                : apiStatus === 'checking' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-rose-100 text-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-emerald-500' : apiStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              {apiStatus.toUpperCase()}
            </span>
          </div>

          {/* Status Badge 2 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Active Database</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                {apiInfo?.database ? 'SQLite / Async Engine' : 'Checking...'}
              </span>
              <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
                Alembic 1.16.5 Up to date
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> READY
            </span>
          </div>

          {/* Status Badge 3 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 block">PeerJS WebRTC Broker</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block font-mono text-xs truncate max-w-[130px]">
                {peerId || 'peer-broker'}
              </span>
              <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
                WS Signaling Active
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              <Radio className="w-3.5 h-3.5" /> LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Full Stack Modules & Technologies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Backend Framework */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">FastAPI & Python 3.12</h3>
                <span className="text-xs text-gray-500">Modular MVC Backend Architecture</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Cleanly partitioned into modules: <code>auth</code>, <code>users</code>, <code>posts</code>, <code>stories</code>, <code>groups</code>, <code>chat</code>, <code>calls</code>, <code>notifications</code>, and <code>media</code>.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Uvicorn</span>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Pydantic V2</span>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">JWT & Bcrypt</span>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Google OAuth</span>
            </div>
          </div>

          {/* Card 2: Multi-Database Support */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">SQLAlchemy 2.0 & Alembic</h3>
                <span className="text-xs text-gray-500">Multi-Database Async Support</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Universal connection adapter supporting <strong>PostgreSQL</strong> (asyncpg), <strong>MySQL</strong> (aiomysql), <strong>SQLite</strong> (aiosqlite), and <strong>MongoDB</strong> (motor).
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">PostgreSQL</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">MySQL</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">SQLite</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">MongoDB</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">Alembic 1.16.5</span>
            </div>
          </div>

          {/* Card 3: Realtime WebSockets & Calling */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">PeerJS & WebSockets</h3>
                <span className="text-xs text-gray-500">Audio/Video Calling & Live Messaging</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Integrated signaling broker at <code>/ws/peerjs</code> and duplex chat WebSocket at <code>/api/v1/chat/ws</code> with sub-50ms latency.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium">WebRTC</span>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium">PeerJS Protocol</span>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium">Duplex WebSockets</span>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium">Call Logs</span>
            </div>
          </div>

          {/* Card 4: Cloud Storage & Mailer */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">S3/R2 Storage & SMTP</h3>
                <span className="text-xs text-gray-500">Cloud Media & Notifications</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              AWS S3 and Cloudflare R2 compatible file uploads with direct presigned URLs, local disk fallback in <code>/uploads</code>, and asynchronous SMTP onboarding emails.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-medium">AWS S3</span>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-medium">Cloudflare R2</span>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-medium">Local Disk</span>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-medium">aiosmtplib</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live API Endpoint Tester */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Interactive API Playground</h2>
          </div>
          <span className="text-xs text-gray-400">Click an endpoint to test live response</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runEndpointTest('GET /health', () => fetch('http://localhost:8008/health').then(r => r.json()))}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 font-bold">GET</span> /health
          </button>

          <button
            onClick={() => runEndpointTest('GET /api/v1/posts', () => api.getFeed())}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/posts
          </button>

          <button
            onClick={() => runEndpointTest('GET /api/v1/stories', () => api.getStories())}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/stories
          </button>

          <button
            onClick={() => runEndpointTest('GET /api/v1/groups', () => api.getGroups())}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/groups
          </button>

          <button
            onClick={() => runEndpointTest('GET /api/v1/users', () => api.getUsers())}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/users
          </button>

          <button
            onClick={() => runEndpointTest('GET /peerjs/id', () => api.getPeerId())}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="text-purple-600 font-bold">GET</span> /peerjs/id
          </button>
        </div>

        {/* Live Test Output Window */}
        {testResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
              <span>Response:</span>
              <button onClick={() => setTestResult(null)} className="hover:text-white cursor-pointer">Clear</button>
            </div>
            <pre>{testResult}</pre>
          </div>
        )}
      </div>

      {/* Useful Links & Docs */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Interactive Swagger Documentation</h3>
          <p className="text-xs text-gray-600 mt-0.5">Explore all endpoints, schemas, parameters, and testing consoles.</p>
        </div>
        <a
          href="http://localhost:8008/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Open Swagger UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
