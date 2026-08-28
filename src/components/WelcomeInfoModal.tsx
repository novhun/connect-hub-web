import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Database, 
  Radio, 
  Cloud, 
  ExternalLink, 
  Activity, 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeInfoModalProps {
  onClose: () => void;
  onNavigateToAbout?: () => void;
}

export const WelcomeInfoModal: React.FC<WelcomeInfoModalProps> = ({
  onClose,
  onNavigateToAbout,
}) => {
  const { language } = useLanguage();
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [peerId, setPeerId] = useState<string>('');

  useEffect(() => {
    api.getHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    api.getPeerId().then(setPeerId).catch(() => {});
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'km' ? 'ព័ត៌មានស្ថាបត្យកម្ម Connect-Hub' : 'Connect-Hub Architecture & Build Info'}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {language === 'km' ? 'វេទិកាសង្គម និងការហៅផ្ទាល់ពេញលេញ' : 'Full Stack Social & Calling Platform'}
            </h2>
            <p className="text-xs text-slate-300">
              Modern Python FastAPI MVC + React 19 + Tailwind v4 + PeerJS WebRTC
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Status Row */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  {language === 'km' ? 'ស្ថានភាព API ផ្ទាល់' : 'Live API Endpoint'}
                </h4>
                <p className="text-xs text-gray-500">FastAPI Backend (8008)</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              apiOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {apiOnline ? (language === 'km' ? 'ដំណើរការ' : 'ONLINE') : (language === 'km' ? 'ដាច់ការតភ្ជាប់' : 'OFFLINE')}
            </span>
          </div>

          {/* Core Technologies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>{language === 'km' ? 'ប្រព័ន្ធ Backend' : 'Backend Core'}</span>
              </div>
              <p className="text-xs text-gray-700 font-semibold">FastAPI + Python 3.12 (MVC Modules)</p>
              <p className="text-[11px] text-gray-500">Pydantic V2, Bcrypt, JWT Bearer, CORS & Error Handler</p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>{language === 'km' ? 'មូលដ្ឋានទិន្នន័យចម្រុះ' : 'Multi-Database Support'}</span>
              </div>
              <p className="text-xs text-gray-700 font-semibold">SQLAlchemy 2.0 & Alembic 1.16.5</p>
              <p className="text-[11px] text-gray-500">PostgreSQL, MySQL, SQLite, MongoDB dynamic engine</p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>{language === 'km' ? 'ការហៅតាម PeerJS & WebSockets' : 'PeerJS & WebSockets'}</span>
              </div>
              <p className="text-xs text-gray-700 font-semibold">WebRTC Audio & Video Calling</p>
              <p className="text-[11px] text-gray-500">Built-in PeerJS signaling broker & Duplex chat socket</p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                <Cloud className="w-4 h-4" />
                <span>{language === 'km' ? 'ពពក Cloud & សារ' : 'Cloud & Communications'}</span>
              </div>
              <p className="text-xs text-gray-700 font-semibold">S3 / Cloudflare R2 & SMTP</p>
              <p className="text-[11px] text-gray-500">Direct presigned media uploads & aiosmtplib mailer</p>
            </div>
          </div>

          {/* Quick API Swagger Button */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div>
              <span className="text-xs font-bold text-blue-900 block">
                {language === 'km' ? 'ឯកសារ OpenAPI Swagger UI' : 'Interactive OpenAPI Swagger UI'}
              </span>
              <span className="text-[11px] text-blue-700">
                {language === 'km' ? 'តេស្ត Endpoints ផ្ទាល់ក្នុង browser' : 'Test live endpoints in your browser'}
              </span>
            </div>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{language === 'km' ? 'បើក /docs' : 'Explore /docs'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Connect-Hub 2026</span>
          <button
            onClick={() => {
              onClose();
              onNavigateToAbout?.();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            {language === 'km' ? 'មើលទំព័រស្ថាបត្យកម្មពេញលេញ' : 'View Full Architecture Page'}
          </button>
        </div>
      </div>
    </div>
  );
};
