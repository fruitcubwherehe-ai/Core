
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

interface VerificationModalProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
  accentColor: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, onCapture, accentColor }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'camera' | 'upload'>('camera');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [view]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied.");
      setView('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Heavy compression helper
  const resizeImage = (source: HTMLVideoElement | HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    // Reduced resolution for extreme space saving
    const MAX_SIZE = 300; 
    let width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    let height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

    if (width > height) {
      if (width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      }
    } else {
      if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(source, 0, 0, width, height);
      // Low quality 0.25 to save significant space while keeping visibility
      return canvas.toDataURL('image/jpeg', 0.25);
    }
    return "";
  };

  const capture = () => {
    if (videoRef.current) {
      const resized = resizeImage(videoRef.current);
      if (resized) onCapture(resized);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          setPreview(resizeImage(img));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmUpload = () => {
    if (preview) {
      onCapture(preview);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-xl bg-[#050505] border border-[#1A1A1A] rounded-[40px] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        <div className="p-8 border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
              <Sparkles size={18} style={{ color: accentColor }} />
            </div>
            <div>
              <h2 className="font-bold uppercase tracking-[0.2em] text-xs">Verify Completion</h2>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">Discipline Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-8 bg-[#0a0a0a] p-1.5 rounded-2xl border border-[#1A1A1A]">
            <button 
              onClick={() => setView('camera')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'camera' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Camera size={14} /> Camera
            </button>
            <button 
              onClick={() => setView('upload')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'upload' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Upload size={14} /> Upload
            </button>
          </div>

          <div className="aspect-square bg-[#030303] relative flex items-center justify-center overflow-hidden rounded-[30px] border border-[#1A1A1A]">
            <AnimatePresence mode="wait">
              {view === 'camera' ? (
                <motion.div 
                  key="camera"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  {error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center gap-4">
                      <AlertCircle size={40} className="text-red-900" />
                      <p className="text-[10px] text-red-500 font-mono uppercase tracking-widest">{error}</p>
                    </div>
                  ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-90 contrast-110" />
                  )}
                  <div className="absolute inset-0 border-[60px] border-black/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full pointer-events-none" />
                </motion.div>
              ) : (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-8 gap-6"
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                       <img src={preview} alt="Upload Preview" className="w-full h-full object-cover rounded-[20px] grayscale" />
                       <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-3 bg-black/80 rounded-2xl text-white">
                         <X size={16} />
                       </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full border-2 border-dashed border-[#1A1A1A] rounded-[30px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                    >
                      <ImageIcon size={48} className="text-gray-800" />
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Select Proof Image</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em] font-mono text-center">
              Awaiting visual verification for system logging (Auto-compressed)
            </p>
            
            {view === 'camera' ? (
              <button 
                disabled={!!error}
                onClick={capture}
                className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white/10 hover:border-white/30 transition-all active:scale-90 group"
              >
                <div className="w-16 h-16 rounded-full shadow-2xl transition-transform group-hover:scale-95" style={{ backgroundColor: accentColor, boxShadow: `0 0 30px ${accentColor}44` }} />
              </button>
            ) : (
              <button 
                disabled={!preview}
                onClick={confirmUpload}
                className={`w-full py-5 rounded-[24px] font-bold uppercase tracking-[0.3em] text-xs transition-all ${preview ? 'bg-white text-black hover:scale-[1.02] active:scale-98 shadow-xl' : 'bg-[#0a0a0a] text-gray-700 cursor-not-allowed border border-[#1A1A1A]'}`}
              >
                Confirm Verification
              </button>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
};

export default VerificationModal;
