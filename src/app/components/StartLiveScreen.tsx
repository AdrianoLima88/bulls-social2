import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Radio, Clock, Users, Lock, Globe, AlertCircle, Camera, Mic, MicOff, VideoOff, SwitchCamera, Sparkles, Download, X } from 'lucide-react';
import { useLives, type Live } from '../../hooks/useLives';
import { liveStreamStore } from '../../utils/liveStreamStore';

interface StartLiveScreenProps {
  onBack: () => void;
  onGoLive: (live: Live) => void;
}

export const StartLiveScreen: React.FC<StartLiveScreenProps> = ({ onBack, onGoLive }) => {
  const { createLive } = useLives();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'premium'>('public');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [currentFilter, setCurrentFilter] = useState<string>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const categories = [
    '📊 Technical Analysis',
    '📈 Fundamental Analysis',
    '📰 Market News',
    '🎓 Financial Education',
    '💼 Trading Strategies',
    '🏢 Corporate Results',
    '💰 Cryptocurrencies',
    '🌎 International Markets',
    '📚 Live Course',
    '💡 Quick Tips',
  ];

  const filters = [
    { name: 'None', value: 'none', style: '' },
    { name: 'Black & White', value: 'grayscale', style: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia', style: 'sepia(100%)' },
    { name: 'High Contrast', value: 'contrast', style: 'contrast(150%) saturate(150%)' },
    { name: 'Vintage', value: 'vintage', style: 'sepia(50%) contrast(120%) brightness(90%)' },
    { name: 'Cool', value: 'cool', style: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm', value: 'warm', style: 'sepia(30%) saturate(150%) brightness(110%)' },
    { name: 'Blur', value: 'blur', style: 'blur(2px)' },
  ];

  // Restart camera when facingMode changes
  useEffect(() => {
    if (isCameraOn && stream) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Mute/unmute mic without restarting the stream
  useEffect(() => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn, stream]);

  const startCamera = async () => {
    setIsRequestingPermission(true);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: isMicOn
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasCamera(true);
      setCameraError('');
      setIsCameraOn(true);
      setIsRequestingPermission(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      setHasCamera(false);
      setStream(null);
      setIsCameraOn(false);
      setIsRequestingPermission(false);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Permission denied. Click the camera icon in the address bar and allow access.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera detected. Connect a camera or continue with the static preview.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraError('The camera is already in use by another app. Close other apps that might be using it.');
      } else if (error.message === 'UNSUPPORTED') {
        setCameraError('Your browser does not support camera access. Use an up-to-date Chrome, Firefox, Safari or Edge.');
      } else {
        setCameraError('Error accessing the camera. Check permissions and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takeScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bulls-live-preview-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            alert('📸 Screenshot saved!');
          }
        });
      }
    }
  };

  const handleStartLive = async () => {
    if (!title.trim()) {
      alert('Please add a title for your live!');
      return;
    }
    if (!category) {
      alert('Please select a category!');
      return;
    }
    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      alert('Please pick a date and time for your scheduled live!');
      return;
    }

    setIsSubmitting(true);
    try {
      const status = isScheduled ? 'scheduled' : 'live';
      const scheduledAt = isScheduled ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null;

      const { data, error } = await createLive({
        title: title.trim(),
        description: description.trim(),
        category,
        privacy,
        status,
        scheduled_at: scheduledAt,
      });

      if (error || !data) {
        alert('Could not save your live. Please try again.');
        return;
      }

      // Save the local camera stream and current filter so WatchLiveScreen can display them
      liveStreamStore.setStream(stream);
      liveStreamStore.setFilter(currentFilter);

      onGoLive(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-xl font-black text-slate-900">Start Live</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Camera preview — real video */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              filter: filters.find(f => f.value === currentFilter)?.style || 'none',
              display: isCameraOn && stream ? 'block' : 'none'
            }}
          />

          <canvas ref={canvasRef} className="hidden" />

          {!stream && isCameraOn && (
            <img
              src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80"
              alt="Camera preview"
              className="w-full h-full object-cover"
              style={{ filter: filters.find(f => f.value === currentFilter)?.style || 'none' }}
            />
          )}

          {/* Darkened overlay when camera is off */}
          {!isCameraOn && !cameraError && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <div className="text-center px-6">
                <Camera className="w-16 h-16 text-white/60 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Camera Preview</h3>
                <p className="text-white/60 text-sm">
                  Click the green camera button below to activate
                </p>
              </div>
            </div>
          )}

          {/* Requesting permission overlay */}
          {isRequestingPermission && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="text-center px-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 border-4 border-green-600/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <Camera className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Requesting Permission...</h3>
                <p className="text-white/80 text-sm max-w-xs mx-auto">
                  Allow camera access in your browser's prompt
                </p>
              </div>
            </div>
          )}

          {/* Permission needed overlay */}
          {!isRequestingPermission && isCameraOn && !stream && cameraError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
              <div className="text-center px-6">
                <Camera className="w-16 h-16 text-white/80 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Camera Permission Needed</h3>
                <p className="text-white/80 text-sm mb-4 max-w-xs mx-auto">
                  {cameraError}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setCameraError('');
                      startCamera();
                    }}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={() => setShowPermissionHelp(true)}
                    className="text-white/70 text-sm underline hover:text-white"
                  >
                    How to allow camera access?
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top controls — filters and switch camera */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </button>

              {showFilters && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-w-40 max-h-64 overflow-y-auto z-50">
                  {filters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setCurrentFilter(filter.value);
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition ${
                        currentFilter === filter.value ? 'bg-green-50 text-green-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleCamera}
              className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition"
              title="Switch camera"
            >
              <SwitchCamera className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={takeScreenshot}
              disabled={!stream || !isCameraOn}
              className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition disabled:opacity-50"
              title="Capture screenshot"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Camera and mic controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => {
                if (isCameraOn) {
                  stopCamera();
                } else {
                  setCameraError('');
                  startCamera();
                }
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? (
                <Camera className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Preview badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
            <div className={`w-2 h-2 ${stream ? 'bg-green-400' : 'bg-slate-400'} rounded-full ${stream ? 'animate-pulse' : ''}`}></div>
            <span className="text-white text-xs font-bold">
              {stream ? 'LIVE' : 'PREVIEW'}
            </span>
          </div>

          {/* Active filter indicator */}
          {currentFilter !== 'none' && (
            <div className="absolute bottom-4 left-4 bg-green-600/90 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="text-white text-xs font-bold">
                ✨ {filters.find(f => f.value === currentFilter)?.name}
              </span>
            </div>
          )}
        </div>

        {/* Status banner */}
        <div className={`${hasCamera && stream ? 'bg-green-50 border-green-200' : cameraError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
          <div className="flex items-start gap-2">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${hasCamera && stream ? 'text-green-600' : cameraError ? 'text-red-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <p className={`${hasCamera && stream ? 'text-green-900' : cameraError ? 'text-red-900' : 'text-blue-900'} text-sm`}>
                <span className="font-semibold">
                  {hasCamera && stream ? '✅ Camera connected!' : cameraError ? '❌ Error accessing camera' : '💡 Ready to start'}
                </span>
                {' '}
                {hasCamera && stream ? (
                  'Your stream is ready to go. Use filters and test your camera!'
                ) : cameraError ? (
                  cameraError
                ) : (
                  'Set up your title and category. Camera works best on mobile or in a new browser tab.'
                )}
              </p>

              {!stream && cameraError && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setCameraError('');
                      setIsCameraOn(true);
                      startCamera();
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition"
                  >
                    🔄 Try again
                  </button>
                  <button
                    onClick={() => setShowPermissionHelp(true)}
                    className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition"
                  >
                    ❓ How to allow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Live Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Market Recap - S&P 500, AAPL, MSFT"
            maxLength={100}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">{title.length}/100 characters</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 px-3 rounded-xl text-sm font-semibold transition ${
                  category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-green-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what you'll cover in this live..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">{description.length}/500 characters</p>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">
            Who can watch?
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setPrivacy('public')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition ${
                privacy === 'public'
                  ? 'bg-green-50 border-2 border-green-600'
                  : 'bg-white border border-slate-300'
              }`}
            >
              <Globe className={`w-6 h-6 ${privacy === 'public' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="flex-1 text-left">
                <p className={`font-bold ${privacy === 'public' ? 'text-green-900' : 'text-slate-900'}`}>
                  Public
                </p>
                <p className="text-sm text-slate-600">Anyone can watch</p>
              </div>
            </button>

            <button
              onClick={() => setPrivacy('followers')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition ${
                privacy === 'followers'
                  ? 'bg-green-50 border-2 border-green-600'
                  : 'bg-white border border-slate-300'
              }`}
            >
              <Users className={`w-6 h-6 ${privacy === 'followers' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="flex-1 text-left">
                <p className={`font-bold ${privacy === 'followers' ? 'text-green-900' : 'text-slate-900'}`}>
                  Followers only
                </p>
                <p className="text-sm text-slate-600">Only people who follow you can watch</p>
              </div>
            </button>

            <button
              onClick={() => setPrivacy('premium')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition ${
                privacy === 'premium'
                  ? 'bg-green-50 border-2 border-green-600'
                  : 'bg-white border border-slate-300'
              }`}
            >
              <Lock className={`w-6 h-6 ${privacy === 'premium' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="flex-1 text-left">
                <p className={`font-bold ${privacy === 'premium' ? 'text-green-900' : 'text-slate-900'}`}>
                  Premium subscribers
                </p>
                <p className="text-sm text-slate-600">Only people subscribed to your premium content</p>
              </div>
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-700" />
              <span className="font-bold text-blue-900">Schedule Live</span>
            </div>
            <button
              onClick={() => setIsScheduled(!isScheduled)}
              className={`w-12 h-6 rounded-full transition relative ${
                isScheduled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                isScheduled ? 'left-6' : 'left-0.5'
              }`}></div>
            </button>
          </div>
          {isScheduled && (
            <div className="space-y-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-blue-800">
                📅 People can tap "Notify me" and will get an alert the moment this live starts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <button
          onClick={handleStartLive}
          disabled={!title.trim() || !category || isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Radio className="w-5 h-5" />
          {isSubmitting ? 'Saving...' : isScheduled ? 'Schedule Live' : 'Start Stream'}
        </button>
      </div>

      {/* Camera permission help modal */}
      {showPermissionHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">How to allow camera access</h3>
              <button
                onClick={() => setShowPermissionHelp(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">🔒 Chrome / Edge</h4>
                <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                  <li>Click the <strong>lock</strong> or <strong>camera</strong> icon in the address bar</li>
                  <li>Select <strong>"Allow"</strong> for camera and microphone</li>
                  <li>Reload the page if needed</li>
                </ol>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">🦊 Firefox</h4>
                <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                  <li>Click the <strong>crossed-out camera</strong> icon in the address bar</li>
                  <li>Click <strong>"Unblock"</strong></li>
                  <li>Allow access when prompted</li>
                </ol>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">🧭 Safari</h4>
                <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                  <li>Open <strong>Safari Preferences</strong></li>
                  <li>Go to <strong>Websites</strong> → <strong>Camera</strong></li>
                  <li>Allow access for this site</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-900 text-xs">
                  💡 <strong>Tip:</strong> If the camera still doesn't work, check if it's being used by another app (Zoom, Teams, etc).
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPermissionHelp(false);
                setCameraError('');
                startCamera();
              }}
              className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-sm"
            >
              Got it, try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
