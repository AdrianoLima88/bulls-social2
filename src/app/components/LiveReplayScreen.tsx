import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Clock, Eye, Heart, DollarSign, Share2, Download, Scissors } from 'lucide-react';

interface LiveReplayScreenProps {
  live: any;
  onClose: () => void;
}

export const LiveReplayScreen: React.FC<LiveReplayScreenProps> = ({ live, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(3600); // 1 hora
  const [showClipModal, setShowClipModal] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  const handleCreateClip = () => {
    alert(`✂️ Clip criado com sucesso!\n\nDuração: ${clipEnd - clipStart}s\nHome: ${formatTime(clipStart)}\nFim: ${formatTime(clipEnd)}\n\nEm produção, isso processaria o vídeo e salvaria.`);
    setShowClipModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-bold">REPLAY</span>
              </div>
              <div className="flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                <Eye className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">{live.viewers?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowClipModal(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition"
              title="Criar Clip"
            >
              <Scissors className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition">
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Info da Live */}
        <div className="mt-4">
          <h2 className="text-white font-bold text-lg line-clamp-2">{live.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <img src={live.host.avatar} alt={live.host.name} className="w-8 h-8 rounded-full" />
            <span className="text-white/80 text-sm">{live.host.name}</span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-white/60 text-xs">Transmitido em {live.date}</span>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <img 
          src={live.thumbnail} 
          alt="Replay"
          className="w-full h-full object-contain"
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button 
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition"
          >
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-2xl">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Stats Overlay */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3">
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm rounded-xl p-3">
            <Heart className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-sm font-bold">{live.likes}</span>
            <span className="text-white/60 text-xs">likes</span>
          </div>
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm rounded-xl p-3">
            <DollarSign className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-sm font-bold">€ {live.revenue || '0'}</span>
            <span className="text-white/60 text-xs">arrecadado</span>
          </div>
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm rounded-xl p-3">
            <Eye className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-sm font-bold">{live.peakViewers || live.viewers}</span>
            <span className="text-white/60 text-xs">pico</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black to-black/95 p-4 border-t border-white/10">
        {/* Timeline */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/60 text-xs">{formatTime(currentTime)}</span>
            <span className="text-white/60 text-xs">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSkip(-10)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
            <button
              onClick={() => handleSkip(10)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Clip Modal */}
      {showClipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Scissors className="w-6 h-6 text-green-500" />
                Criar Clip
              </h3>
              <button
                onClick={() => setShowClipModal(false)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 text-sm mb-4">
                Selecione o trecho da live que você deseja recortar. O clip pode ter até 60 seconds.
              </p>

              {/* Home */}
              <div className="mb-4">
                <label className="text-white text-sm font-bold mb-2 block">Home</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={clipStart}
                  onChange={(e) => setClipStart(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
                />
                <span className="text-white/60 text-xs">{formatTime(clipStart)}</span>
              </div>

              {/* Fim */}
              <div className="mb-4">
                <label className="text-white text-sm font-bold mb-2 block">Fim</label>
                <input
                  type="range"
                  min={clipStart}
                  max={Math.min(duration, clipStart + 60)}
                  value={clipEnd}
                  onChange={(e) => setClipEnd(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
                />
                <span className="text-white/60 text-xs">{formatTime(clipEnd)}</span>
              </div>

              {/* Duração */}
              <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-3 mb-4">
                <p className="text-green-400 text-sm font-bold">
                  Clip duration: {clipEnd - clipStart} seconds
                </p>
              </div>

              {/* Título */}
              <input
                type="text"
                placeholder="Clip title (optional)"
                className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleCreateClip}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg"
            >
              Criar Clip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
