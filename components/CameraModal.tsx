
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
  accentColor: string;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture, accentColor }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        setError("Camera permission denied. Proof cannot be established.");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(data);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-black border border-[#1A1A1A] rounded-[30px] overflow-hidden relative"
      >
        <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Camera size={16} style={{ color: accentColor }} />
            Proof of Work
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="aspect-video bg-[#050505] relative flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-10 text-center space-y-4">
              <AlertCircle size={48} className="mx-auto text-red-600 opacity-50" />
              <p className="font-mono text-xs text-red-500 uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover grayscale brightness-75 contrast-125"
              />
              {/* Camera Overlays */}
              <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full pointer-events-none" />
            </>
          )}
        </div>

        <div className="p-8 flex flex-col items-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 font-mono text-center max-w-xs">
            Capture image evidence to validate node completion. No proof, no progress.
          </p>
          
          <button 
            disabled={!!error}
            onClick={capture}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-90 ${
              error ? 'border-[#1A1A1A] text-gray-800' : 'border-white/20 hover:border-white text-white'
            }`}
          >
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: error ? '#111' : accentColor }} />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
};

export default CameraModal;
