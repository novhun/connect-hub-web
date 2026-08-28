import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Headphones, 
  Send, 
  MessageSquare,
  Bot,
  CheckCheck,
  User,
  Volume2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SupportCenterModalProps {
  mode: 'audio' | 'video' | 'chat';
  onClose: () => void;
}

export const SupportCenterModal: React.FC<SupportCenterModalProps> = ({
  mode,
  onClose,
}) => {
  const { t, language } = useLanguage();
  // Call states
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'agent'; text: string; time: string }[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: language === 'km' 
        ? 'សួស្តី សុគន្ធ! សូមស្វាគមន៍មកកាន់ផ្នែកជំនួយ ConnectHub។ តើយើងអាចជួយអ្វីដល់អ្នកនៅថ្ងៃនេះ?' 
        : 'Hello Sokun! Welcome to ConnectHub Support. How can we help you today?',
      time: language === 'km' ? 'ទើបតែមុននេះ' : 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Timer for calls
  useEffect(() => {
    let ringingTimer: NodeJS.Timeout;
    let durationTimer: NodeJS.Timeout;

    if (mode === 'audio' || mode === 'video') {
      ringingTimer = setTimeout(() => {
        setCallState('connected');
      }, 2000);
    }

    if (callState === 'connected') {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(ringingTimer);
      clearInterval(durationTimer);
    };
  }, [mode, callState]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsAgentTyping(true);

    setTimeout(() => {
      let reply = language === 'km'
        ? "សូមអរគុណសម្រាប់ការទាក់ទងមកយើង! ក្រុមការងាររបស់យើងកំពុងពិនិត្យមើលការកំណត់គណនី និងសិទ្ធិសហគមន៍របស់អ្នក។"
        : "Thank you for reaching out! Our team is reviewing your account settings and community permissions.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('post') || lower.includes('photo') || lower.includes('រូប') || lower.includes('បង្ហោះ')) {
        reply = language === 'km'
          ? "អ្នកអាចចែករំលែកការបង្ហោះ និងផ្ទុករូបថតឡើងដោយផ្ទាល់តាមរយៈប្រអប់ 'តើអ្នកកំពុងគិតអ្វី?' នៅផ្នែកខាងលើនៃផ្ទាំងព័ត៌មាន ឬប៊ូតុងនៅរបារចំហៀងខាងឆ្វេង!"
          : "You can share posts and upload photos directly using the 'Create Post' box at the top of your feed or the left sidebar button!";
      } else if (lower.includes('story') || lower.includes('stories') || lower.includes('រឿងរ៉ាវ')) {
        reply = language === 'km'
          ? "រឿងរ៉ាវ (Stories) មានសុពលភាពរយៈពេល ២៤ ម៉ោង។ ចុចលើ '+ បង្កើតរឿងរ៉ាវ' លើផ្ទាំងរឿងរ៉ាវដើម្បីចែករំលែកបច្ចុប្បន្នភាពរហ័ស!"
          : "Stories stay active for 24 hours. Tap '+ Create Story' on your stories carousel to share a quick update!";
      } else if (lower.includes('group') || lower.includes('community') || lower.includes('ក្រុម')) {
        reply = language === 'km'
          ? "បច្ចុប្បន្នអ្នកគ្រប់គ្រងក្រុម Tech Enthusiasts និង UI/UX Designers ពីផ្ទាំងរបារចំហៀងខាងស្តាំរបស់អ្នក។"
          : "You currently manage Tech Enthusiasts and UI/UX Designers groups from your right sidebar panel.";
      } else if (lower.includes('call') || lower.includes('voice') || lower.includes('ហៅ')) {
        reply = language === 'km'
          ? "ConnectHub គាំទ្រការហៅជាសំឡេងច្បាស់ល្អ និងការហៅជាវីដេអូកម្រិត HD នៅលើគ្រប់ឧបករណ៍របស់អ្នក!"
          : "ConnectHub supports crystal-clear audio and HD video calls across all your devices!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAgentTyping(false);
    }, 1200);
  };

  const getModeTitle = () => {
    if (mode === 'audio') return language === 'km' ? 'ជំនួយជាសំឡេង ConnectHub' : 'ConnectHub Audio Support';
    if (mode === 'video') return language === 'km' ? 'ជំនួយជាវីដេអូ ConnectHub' : 'ConnectHub Video Support';
    return language === 'km' ? 'ការជជែកផ្ទាល់ ConnectHub' : 'ConnectHub Live Chat';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {mode === 'audio' ? <Phone className="w-4 h-4" /> : mode === 'video' ? <VideoIcon className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {getModeTitle()}
              </h3>
              <p className="text-xs text-gray-500">
                {mode === 'chat' 
                  ? (language === 'km' ? 'អ្នកឯកទេសជំនួយផ្លូវការ • កំពុងដំណើរការ' : 'Official Support Specialist • Active Now')
                  : callState === 'ringing' 
                    ? (language === 'km' ? 'កំពុងតភ្ជាប់ទៅកាន់ភ្នាក់ងារជំនួយ...' : 'Connecting to support agent...')
                    : `${language === 'km' ? 'កំពុងសន្ទនា' : 'In call'} • ${formatDuration(callDuration)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY FOR AUDIO CALL */}
        {mode === 'audio' && (
          <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center bg-radial from-blue-50/50 to-white">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl border-4 border-white animate-pulse">
                <Headphones className="w-12 h-12 text-white" />
              </div>
              {callState === 'connected' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-lg">{language === 'km' ? 'តំណាងផ្នែកជំនួយ (Sarah)' : 'Support Representative (Sarah)'}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {callState === 'ringing' 
                  ? (language === 'km' ? 'កំពុងរោទ៍...' : 'Ringing...') 
                  : `${language === 'km' ? 'បានតភ្ជាប់' : 'Connected'} (${formatDuration(callDuration)})`}
              </p>
            </div>

            {/* Audio wave animation */}
            {callState === 'connected' && (
              <div className="flex items-center gap-1 h-8">
                {[40, 75, 90, 50, 80, 100, 60, 45, 85, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Call Controls */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* BODY FOR VIDEO CALL */}
        {mode === 'video' && (
          <div className="p-4 space-y-4 bg-gray-900 text-white">
            <div className="relative h-64 bg-gray-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {/* Agent video simulation */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                alt="Agent Video Stream"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Sarah (Support Lead)</span>
              </div>

              {/* User PiP Preview */}
              <div className="absolute bottom-3 right-3 w-24 h-32 bg-gray-700 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg">
                {!isVideoOff ? (
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1horplrAC7-0mqM4pGaHQzkfN9hQFEbB-LQk1RVMQWmH4kvrm5Wi2JO13QXkYhIOkj4bbOvM2aNCt0HSVS1T0zd8j13I9XWJsCMLRdo0vKr96D66Qo_Vn_6n0gZc0kEdYkxfj1JWmlK6xcp_K-cL30veV-dcIDDc0mgJsnZ2BPcJzZigeSg8ujHuBS90WEtA2SijWotiMoc3XWG7OIZC9yEMnaTkUHaIBTImIm1YuUfbVS1u5VXgt"
                    alt="Your preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                    <VideoOff className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Video Controls */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-colors cursor-pointer ${
                  isMuted ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition-colors cursor-pointer ${
                  isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* BODY FOR LIVE CHAT */}
        {mode === 'chat' && (
          <div className="flex flex-col h-96">
            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#2563eb] text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isAgentTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Headphones className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-gray-200 p-2.5 rounded-2xl rounded-bl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={language === 'km' ? 'វាយសំណួររបស់អ្នកនៅទីនេះ...' : 'Type your question...'}
                className="flex-1 bg-gray-100 focus:bg-white text-sm text-gray-800 placeholder-gray-400 rounded-xl px-3.5 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
