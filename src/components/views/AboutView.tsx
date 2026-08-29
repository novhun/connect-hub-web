import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  Radio,
  ShieldCheck,
  Layers,
  Cloud,
  Zap,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Activity,
  RefreshCw,
  Sparkles,
  Video,
  Globe,
  Share2,
  Users,
  MessageSquare,
  Lock,
  Heart,
  Compass,
  ArrowRight,
  HelpCircle,
  Award,
  Flame,
  Smartphone,
  PhoneCall,
  Wifi,
  WifiOff,
  Check,
  Copy,
  GitBranch,
  Star,
  Code2,
  Headphones,
  Phone
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { copyToClipboard } from '../../utils/clipboard';
import appLogo from '../../assets/icons/icon.png';

interface AboutViewProps {
  currentUser?: User;
  onStartDemoCall?: (type: 'audio' | 'video') => void;
  onOpenSupport?: (mode: 'chat' | 'audio' | 'video') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  currentUser,
  onStartDemoCall,
  onOpenSupport,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'platform' | 'architecture' | 'opensource'>('platform');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [latency, setLatency] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);

  const checkHealth = async () => {
    setApiStatus('checking');
    const start = performance.now();
    try {
      const data = await api.getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setApiInfo(data);
      setApiStatus('online');

      try {
        const id = await api.getPeerId();
        setPeerId(id);
      } catch (_) { }
    } catch (e) {
      setApiStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleCopyClone = async (repoUrl: string, id: string) => {
    const cmd = `git clone ${repoUrl}`;
    const success = await copyToClipboard(cmd);
    if (success) {
      setCopiedRepo(id);
      setTimeout(() => setCopiedRepo(null), 2500);
    }
  };

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

  const getStatusLabel = () => {
    if (apiStatus === 'online') {
      return language === 'km' ? 'ដំណើរការ' : 'Online';
    }
    if (apiStatus === 'checking') {
      return language === 'km' ? 'កំពុងពិនិត្យ (Checking...)' : 'Checking...';
    }
    return language === 'km' ? 'ដាច់ការតភ្ជាប់ (Offline)' : 'Offline';
  };

  const openSourceRepos = [
    {
      id: 'web',
      name: 'connect-hub-web',
      type: language === 'km' ? 'កម្មវិធី Frontend Web' : 'Frontend Web Application',
      description:
        language === 'km'
          ? 'វេបសាយ Frontend ទំនើប គាំទ្រភាសាខ្មែរ ១០០% ការហៅទូរស័ព្ទ HD ផ្ទាល់តាម WebRTC ឃ្លីបវីដេអូខ្លី (Clips) សាច់រឿង (Stories) និងសារជជែកឆ្លើយឆ្លងភ្លាមៗ។'
          : 'Modern bilingual (Khmer/English) social frontend featuring WebRTC HD peer-to-peer audio/video calls, vertical snap Clips, Stories, real-time floating chat, and responsive UI.',
      gitUrl: 'https://github.com/novhun/connect-hub-web.git',
      webUrl: 'https://github.com/novhun/connect-hub-web',
      tags: ['React 19', 'TypeScript', 'Vite', 'TailwindCSS', 'WebRTC', 'PWA'],
      color: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'api',
      name: 'connect-hub-api',
      type: language === 'km' ? 'ម៉ាស៊ីនបម្រើ Backend REST API' : 'Backend REST API Server',
      description:
        language === 'km'
          ? 'ម៉ាស៊ីនបម្រើ REST API ល្បឿនលឿន ជាមួយស្ថាបត្យកម្ម Modular MVC ការផ្ទៀងផ្ទាត់ JWT ការធ្វើចំណាកស្រុកស្វ័យប្រវត្តិ Alembic និងប្រព័ន្ធ PeerJS Signaling។'
          : 'High-performance async REST API backend with modular MVC architecture, JWT auth, WebSocket real-time messaging, Alembic migrations, PostgreSQL, and WebRTC broker.',
      gitUrl: 'https://github.com/novhun/connect-hub-api.git',
      webUrl: 'https://github.com/novhun/connect-hub-api',
      tags: ['FastAPI', 'Python 3.12', 'PostgreSQL', 'SQLAlchemy 2.0', 'Alembic', 'PeerJS'],
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-200">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e293b] text-white p-6 sm:p-10 shadow-2xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {language === 'km' ? 'បណ្តាញសង្គមជំនាន់ថ្មី' : 'Next-Generation Social Experience'}
              </span>
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                v1.2.0
              </span>
            </div>

            {/* Live Status Pill in Hero */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${apiStatus === 'online'
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              : apiStatus === 'checking'
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
              }`}>
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : apiStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
              <span>
                {language === 'km' ? 'ស្ថានភាព: ' : 'Status: '}
                {getStatusLabel()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-white/20 shrink-0">
              <img src={appLogo} alt="Connect-Hub Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'km' ? 'ស្វាគមន៍មកកាន់ ' : 'Welcome to '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Connect Hub
              </span>
            </h1>
          </div>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'km'
              ? 'វេទិកាបណ្តាញសង្គមដ៏ទំនើប រហ័ស និងមានសុវត្ថិភាពខ្ពស់ ត្រូវបានបង្កើតឡើងដើម្បីភ្ជាប់ទំនាក់ទំនងមនុស្ស សហគមន៍ និងការចែករំលែកពេលវេលាដ៏មានតម្លៃ ដោយគាំទ្រភាសាខ្មែរពេញលេញ ការហៅទូរស័ព្ទ HD ផ្ទាល់ និងបទពិសោធន៍ដ៏រលូន។'
              : 'A modern, lightning-fast, and secure social platform built to bring people together, empower communities, and elevate social connections with seamless HD calling, rich multimedia sharing, and bilingual support.'}
          </p>

          {/* Tab Switcher in Hero */}
          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={() => setActiveTab('platform')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${activeTab === 'platform'
                ? 'bg-blue-600 text-white shadow-blue-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'km' ? 'អំពីវេទិកា & លក្ខណៈពិសេស' : 'Platform & Features'}</span>
            </button>

            <button
              onClick={() => setActiveTab('opensource')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${activeTab === 'opensource'
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>{language === 'km' ? 'កូដបើកចំហ (Open Source)' : 'Open Source Repositories'}</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${activeTab === 'architecture'
                ? 'bg-purple-600 text-white shadow-purple-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>{language === 'km' ? 'ស្ថាបត្យកម្ម & ស្ថានភាពប្រព័ន្ធ' : 'Architecture & Health'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1b. DEDICATED LIVE SUPPORT CENTER HUB (Shown on About page) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-blue-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-400 border border-blue-400/30 shadow-inner shrink-0">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {language === 'km' ? 'មជ្ឈមណ្ឌលជំនួយផ្ទាល់ (Support Center)' : 'Live Support & Help Center'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'km' ? 'អនឡាញ 24/7' : '24/7 Online'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'km'
                  ? 'ត្រូវការជំនួយ ឬចង់សាកសួរព័ត៌មានបន្ថែម? ក្រុមការងាររបស់យើងត្រៀមជួយអ្នកគ្រប់ពេលវេលា។'
                  : 'Need assistance, account help, or have questions? Our support team is ready to assist you in real time.'}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => onOpenSupport ? onOpenSupport('chat') : onStartDemoCall?.('audio')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ជជែកផ្ទាល់ (Live Chat)' : 'Live Chat'}</span>
            </button>
            <button
              onClick={() => onOpenSupport ? onOpenSupport('audio') : onStartDemoCall?.('audio')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ហៅជាសំឡេង (Audio)' : 'Audio Call'}</span>
            </button>
            <button
              onClick={() => onOpenSupport ? onOpenSupport('video') : onStartDemoCall?.('video')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ហៅជាវីដេអូ (Video)' : 'Video Call'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. OPEN SOURCE HIGHLIGHT BANNER (Shown across tabs) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/15 shadow-inner">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  {language === 'km' ? 'គម្រោងកូដបើកចំហ (Open Source Project)' : 'Open Source Repositories'}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MIT License
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'km'
                  ? 'គម្រោងនេះជា Open Source សម្រាប់សហគមន៍អ្នកអភិវឌ្ឍន៍។ អ្នកអាចទាញយក និងចូលរួមអភិវឌ្ឍន៍នៅលើ GitHub!'
                  : 'Connect-Hub is 100% open source. Check out the frontend and backend repositories on GitHub!'}
              </p>
            </div>
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {openSourceRepos.map((repo) => (
            <div
              key={repo.id}
              className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/70 hover:border-indigo-400/50 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white border border-white/10 shrink-0">
                      <GitBranch className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors">
                        {repo.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">{repo.type}</span>
                    </div>
                  </div>

                  <a
                    href={repo.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {repo.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {repo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 text-[10px] font-semibold border border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clone Command Box & Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60">
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="truncate text-[11px] text-emerald-400 select-all">
                    git clone {repo.gitUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyClone(repo.gitUrl, repo.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${copiedRepo === repo.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                  >
                    {copiedRepo === repo.id ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>{language === 'km' ? 'បានចម្លង!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>{language === 'km' ? 'ចម្លង' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={repo.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{language === 'km' ? 'មើលនៅលើ GitHub' : 'View Repository'}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MIT License Full Text Card */}
        <div className="mt-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-400/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {language === 'km' ? 'អាជ្ញាប័ណ្ណ MIT License' : 'MIT License'}
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">
              2026 novhun
            </span>
          </div>
          <pre className="text-slate-400 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words bg-slate-950/50 rounded-xl p-4 border border-slate-800 select-all overflow-x-auto">
            {`MIT License

Copyright (c) 2026 novhun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </div>
      </div>

      {/* 3. TAB CONTENT 1: PLATFORM & FEATURES */}
      {activeTab === 'platform' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
          {/* Mission & Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'km' ? 'គាំទ្រភាសាខ្មែរ ១០០%' : 'Full Bilingual Experience'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'km'
                  ? 'រចនាឡើងជាមួយពុម្ពអក្សរជាតិ Kantumruy Pro ដែលងាយស្រួលមើល ផ្តល់បទពិសោធន៍ល្អឥតខ្ចោះទាំងភាសាខ្មែរ និងអង់គ្លេស។'
                  : 'Engineered from the ground up for Cambodia and the globe with Kantumruy Pro typography and instant language toggling.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'km' ? 'ការហៅជាសំឡេង និងវីដេអូ HD' : 'HD Peer-to-Peer Calling'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'km'
                  ? 'ការហៅផ្ទាល់តាមបច្ចេកវិទ្យា WebRTC P2P ដែលមានកម្រិតភាពយឺតទាប (Low Latency) សំឡេងច្បាស់ និងរូបភាពម៉ដ្ឋល្អ។'
                  : 'Real-time audio and video communications powered by WebRTC P2P signaling with instant ringtone notifications.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'km' ? 'ឯកជនភាព និងសុវត្ថិភាព' : 'Privacy-First & Secure'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'km'
                  ? 'ការកំណត់ភាពឯកជនភាពការបង្ហោះ (សាធារណៈ, មិត្តភក្តិ, ឬតែខ្ញុំ) ជាមួយការការពារទិន្នន័យដោយស្តង់ដារ JWT និង HTTPS។'
                  : 'Granular privacy audiences for your posts, encrypted auth tokens, and safe content moderation controls.'}
              </p>
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>{language === 'km' ? 'លក្ខណៈពិសេសស្នូលរបស់ មជ្ឈមណ្ឌលតភ្ជាប់' : 'Core Platform Features'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'km' ? 'ការបង្កើត និងចែករំលែកការបង្ហោះ' : 'Rich Feed & Interactive Posts'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {language === 'km' ? 'ការបង្ហោះ រូបភាព អារម្មណ៍ និងទីតាំង' : 'Posts, Photos, Feelings & Locations'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'km'
                    ? 'ចែករំលែករូបភាព ការបញ្ចេញមតិ អារម្មណ៍ ទីតាំង ការកែសម្រួល ឬលុបការបង្ហោះ និងការចែករំលែកបន្តទៅកាន់មិត្តភក្តិ។'
                    : 'Create and edit posts with multiple photos, feelings, locations, group tagging, comment discussions, and 7 expressive reactions.'}
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'km' ? 'សារជជែកឆ្លើយឆ្លងផ្ទាល់' : 'Real-time Messaging & Floating Chat'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {language === 'km' ? 'ការជជែកផ្ទាល់ និងវត្តមានអនឡាញ' : 'Direct Chat & Online Presence'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'km'
                    ? 'ផ្ញើសារជជែកផ្ទាល់ជាមួយមិត្តភក្តិ ផ្ទាំង Chat អណ្តែត (Floating Window) និងការជូនដំណឹងភ្លាមៗនៅពេលមានសារថ្មី។'
                    : 'Chat in real-time with online friends, utilize floating chat popups while browsing the feed, and track live status.'}
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'km' ? 'សហគមន៍ និងក្រុមពិភាក្សា' : 'Communities & Interest Groups'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {language === 'km' ? 'ចូលរួម និងគ្រប់គ្រងក្រុម' : 'Join & Manage Groups'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'km'
                    ? 'ស្វែងរកក្រុមបច្ចេកវិទ្យា ការអប់រំ ការកម្សាន្ត និងបង្កើតក្រុមផ្ទាល់ខ្លួនដើម្បីប្រមូលផ្តុំសមាជិកដែលមានចំណូលចិត្តដូចគ្នា។'
                    : 'Discover tech, education, photography, and creative groups. Join discussions or build your own managed community.'}
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {language === 'km' ? 'កម្រងព័ត៌មាន និងរូបភាពគម្រប' : 'Custom Profiles & Cover Banners'}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {language === 'km' ? 'ការរចនាគណនីផ្ទាល់ខ្លួន' : 'Personalized Branding'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {language === 'km'
                    ? 'កែសម្រួលជីវប្រវត្តិ ជំនាញ តួនាទី គេហទំព័រ ទីតាំង និងជ្រើសរើសរូបភាពគម្របស្អាតៗ ឬបញ្ចូលរូបផ្ទាល់ខ្លួន។'
                    : 'Personalize your profile with custom avatars, scenic cover photos, bio descriptions, job titles, and portfolio links.'}
                </p>
              </div>
            </div>
          </div>

          {/* Community Values & Made in Cambodia Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>{language === 'km' ? 'បង្កើតឡើងសម្រាប់អ្នក' : 'Crafted with Passion'}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {language === 'km' ? 'ភ្ជាប់ទំនាក់ទំនងមនុស្សរាប់ពាន់នាក់' : 'Connecting thousands of inspiring minds'}
              </h3>
              <p className="text-xs text-gray-600">
                {language === 'km'
                  ? 'មជ្ឈមណ្ឌលតភ្ជាប់ ប្តេជ្ញាផ្តល់នូវបទពិសោធន៍ប្រព័ន្ធផ្សព្វផ្សាយសង្គមប្រកបដោយការគោរព សុវត្ថិភាព និងភាពច្នៃប្រឌិត។'
                  : 'Connect Hub is committed to providing a respectful, creative, and safe social media environment for everyone.'}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {onStartDemoCall && (
                <button
                  onClick={() => onStartDemoCall('video')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'សាកល្បងការហៅ' : 'Try Video Call'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT 2: ARCHITECTURE & SYSTEM STATUS */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Live System Health & Connection Monitor */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {language === 'km' ? 'ស្ថានភាព API & សេវាកម្មផ្ទាល់' : 'Live API & Microservices Health'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {language === 'km' ? 'ស្ថានភាពដំណើរការរបស់ប្រព័ន្ធ Server តាមពេលវេលាជាក់ស្តែង' : 'Real-time status of backend services & database'}
                  </p>
                </div>
              </div>

              <button
                onClick={checkHealth}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>{language === 'km' ? 'ផ្ទុកឡើងវិញ' : 'Refresh Status'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
              {/* Status Badge 1: FastAPI Server */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">
                    {language === 'km' ? 'ម៉ាស៊ីនបម្រើ FastAPI' : 'FastAPI Server'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block truncate">
                    {language === 'km' ? 'ស្ថានភាព: ' : 'Status: '}
                    {getStatusLabel()}
                  </span>
                  {latency !== null && (
                    <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                      ⚡ {language === 'km' ? 'ល្បឿនឆ្លើយតប' : 'Latency'}: {latency}ms
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${apiStatus === 'online'
                  ? 'bg-emerald-100 text-emerald-700'
                  : apiStatus === 'checking'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : apiStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  {apiStatus === 'online' ? (language === 'km' ? 'អនឡាញ' : 'ONLINE') : apiStatus === 'checking' ? (language === 'km' ? 'កំពុងពិនិត្យ' : 'CHECKING') : (language === 'km' ? 'អော့ហ្វឡាញ' : 'OFFLINE')}
                </span>
              </div>

              {/* Status Badge 2: PostgreSQL / Database */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">
                    {language === 'km' ? 'មូលដ្ឋានទិន្នន័យ' : 'Active Database'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                    PostgreSQL / Supabase
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
                    {language === 'km' ? 'Alembic ធ្វើសមកាលកម្មរួច' : 'Alembic Migrations Synced'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'សកម្ម' : 'ACTIVE'}</span>
                </span>
              </div>

              {/* Status Badge 3: WebRTC Signaling */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 block">
                    {language === 'km' ? 'ប្រព័ន្ធ PeerJS WebRTC' : 'PeerJS WebRTC Broker'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block font-mono text-xs truncate max-w-[130px]">
                    {peerId || 'peer-broker'}
                  </span>
                  <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
                    {language === 'km' ? 'ការហៅជាសំឡេង/វីដេអូសកម្ម' : 'P2P Audio/Video Live'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'រួចរាល់' : 'READY'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tech Stack Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Backend */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">FastAPI & Python 3.12</h3>
                  <span className="text-xs text-gray-500">
                    {language === 'km' ? 'ស្ថាបត្យកម្ម Modular MVC Backend' : 'Modular MVC Architecture'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'km'
                  ? 'រៀបចំជាម៉ូឌុលស្អាតបាត៖ auth, users, posts, stories, groups, chat, calls, notifications, events, និង media។'
                  : 'Cleanly partitioned into modules: auth, users, posts, stories, groups, chat, calls, notifications, and media.'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Uvicorn</span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Pydantic V2</span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">Google OAuth</span>
              </div>
            </div>

            {/* Card 2: Database Layer */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">SQLAlchemy 2.0 & Multi-DB</h3>
                  <span className="text-xs text-gray-500">
                    {language === 'km' ? 'ប្រព័ន្ធ ORM មូលដ្ឋានទិន្នន័យ Async' : 'Async Database ORM'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {language === 'km'
                  ? 'គាំទ្រ PostgreSQL (asyncpg/Supabase), SQLite (aiosqlite), MySQL (aiomysql) និង MongoDB (Motor)។'
                  : 'Universal engine supporting PostgreSQL (asyncpg/Supabase), SQLite (aiosqlite), and MySQL (aiomysql).'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">PostgreSQL</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">Alembic</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">Cloudflare R2</span>
              </div>
            </div>
          </div>

          {/* Interactive Live API Endpoint Tester */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-gray-900">
                  {language === 'km' ? 'ផ្ទាំងតេស្ត API ផ្ទាល់ (Interactive Tester)' : 'Live API Testing Console'}
                </h2>
              </div>
              <span className="text-xs text-gray-400">
                {language === 'km' ? 'ចុចលើ Endpoint ដើម្បីមើលការឆ្លើយតប' : 'Click an endpoint to run live test'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runEndpointTest('GET /health', () => api.getHealth())}
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
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800 animate-in fade-in duration-100">
                <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                  <span>{language === 'km' ? 'លទ្ធផលឆ្លើយតប (Response):' : 'Response Payload:'}</span>
                  <button onClick={() => setTestResult(null)} className="hover:text-white cursor-pointer">
                    {language === 'km' ? 'សម្អាត' : 'Clear'}
                  </button>
                </div>
                <pre>{testResult}</pre>
              </div>
            )}
          </div>

          {/* Swagger UI Docs Card */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {language === 'km' ? 'ឯកសារ Swagger API អន្តរកម្ម' : 'Interactive Swagger Documentation'}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {language === 'km'
                  ? 'ស្វែងយល់ពីគ្រប់ Endpoints, Schemas និងតេស្តដោយផ្ទាល់។'
                  : 'Explore all endpoints, schemas, parameters, and testing consoles.'}
              </p>
            </div>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{language === 'km' ? 'បើក Swagger UI' : 'Open Swagger UI'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
