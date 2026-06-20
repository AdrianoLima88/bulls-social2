import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, Phone, Maximize2, SwitchCamera } from 'lucide-react';

export const VideoCallScreen = ({ onEnd, userName, userAvatar }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Chamando...');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Simula a conexão da chamada
    const connectTimer = setTimeout(() => {
      setCallStatus('Conectado');
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    // Accountdor de duração da chamada
    if (callStatus === 'Conectado') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Vídeo Principal (do outro usuário) */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900">
        {callStatus === 'Conectado' ? (
          // Simulação de vídeo do outro usuário
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-blue-900/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                <span className="text-white text-6xl font-bold">
                  {userAvatar || 'MS'}
                </span>
              </div>
              <p className="text-white text-xl font-semibold">{userName || 'Maria Silva'}</p>
            </div>
          </div>
        ) : (
          // Tela de carregamento
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                <span className="text-white text-5xl font-bold">
                  {userAvatar || 'MS'}
                </span>
              </div>
              <p className="text-white text-lg">{callStatus}</p>
            </div>
          </div>
        )}

        {/* Informações no topo */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">{userName || 'Maria Silva'}</h2>
              <p className="text-white/80 text-sm">
                {callStatus === 'Conectado' ? formatDuration(callDuration) : callStatus}
              </p>
            </div>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Vídeo Próprio (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-28 h-36 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          {isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">Você</span>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>

        {/* Indicadores de Status */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {isMuted && (
            <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <MicOff className="w-3 h-3" />
              <span>Mudo</span>
            </div>
          )}
          {!isVideoOn && (
            <div className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <VideoOff className="w-3 h-3" />
              <span>Camera off</span>
            </div>
          )}
        </div>
      </div>

      {/* Controles Inferiores */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Câmera Frontal/Traseira */}
          <button
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
          >
            <SwitchCamera className="w-6 h-6 text-white" />
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Encerrar Chamada */}
          <button
            onClick={onEnd}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg transform hover:scale-105"
          >
            <Phone className="w-7 h-7 text-white transform rotate-135" />
          </button>

          {/* Vídeo On/Off */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isVideoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'
            }`}
          >
            {isVideoOn ? (
              <VideoIcon className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onEnd}
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
