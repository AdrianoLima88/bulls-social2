import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Phone } from 'lucide-react';

export const VoiceCallScreen = ({ onEnd, userName, userAvatar }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Chamando...');

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
    <div className="fixed inset-0 bg-gradient-to-b from-green-600 to-green-800 z-50 flex flex-col items-center justify-between p-8">
      {/* Header */}
      <div className="w-full flex justify-end">
        <button
          onClick={onEnd}
          className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Avatar e Info do Usuário */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-6">
          {/* Círculos animados quando conectado */}
          {callStatus === 'Conectado' && (
            <>
              <div className="absolute inset-0 -m-8 rounded-full bg-white/20 animate-ping"></div>
              <div className="absolute inset-0 -m-4 rounded-full bg-white/30 animate-pulse"></div>
            </>
          )}
          
          {/* Avatar */}
          <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center relative z-10">
            <span className="text-white text-5xl font-bold">
              {userAvatar || 'MS'}
            </span>
          </div>
        </div>

        <h2 className="text-white text-3xl font-bold mb-2">
          {userName || 'Maria Silva'}
        </h2>
        
        <p className="text-white/80 text-lg">
          {callStatus === 'Conectado' ? formatDuration(callDuration) : callStatus}
        </p>

        {/* Ondas de som visual */}
        {callStatus === 'Conectado' && !isMuted && (
          <div className="flex gap-1 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 30 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </button>

          {/* Encerrar Chamada */}
          <button
            onClick={onEnd}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg transform hover:scale-105"
          >
            <Phone className="w-8 h-8 text-white transform rotate-135" />
          </button>

          {/* Speaker On/Off */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              isSpeakerOn ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10'
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-7 h-7 text-white" />
            ) : (
              <VolumeX className="w-7 h-7 text-white/50" />
            )}
          </button>
        </div>

        {/* Indicadores de Status */}
        <div className="text-center space-y-2">
          {isMuted && (
            <p className="text-white/80 text-sm">🔇 Microfone desligado</p>
          )}
          {!isSpeakerOn && (
            <p className="text-white/80 text-sm">🔈 Alto-falante desligado</p>
          )}
        </div>
      </div>
    </div>
  );
};
