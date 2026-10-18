import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Check, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface CameraCaptureProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  category?: 'borrower_photo' | 'id_front' | 'id_back' | 'collateral' | 'signature';
  aspectRatio?: 'square' | 'card' | 'free';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  label,
  sublabel,
  value,
  onChange,
  category = 'borrower_photo',
  aspectRatio = 'square',
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMsg('Could not access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      uploadImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        uploadImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (base64Data: string, originalName?: string) => {
    setUploading(true);
    try {
      const res = await api.uploadFile(base64Data, originalName, category);
      if (res.url) {
        onChange(res.url);
      } else {
        onChange(base64Data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback: use raw data url
      onChange(base64Data);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aspectClass =
    aspectRatio === 'card'
      ? 'aspect-[1.586/1]' // Standard ID card ratio
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-video';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-800">{label}</label>
          {sublabel && <p className="text-[11px] text-slate-500">{sublabel}</p>}
        </div>
        {value && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <Check className="h-3 w-3" /> Captured
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
          {errorMsg}
        </div>
      )}

      {/* Main preview box */}
      <div className={`relative overflow-hidden rounded-xl border-2 border-dashed ${value ? 'border-emerald-300 bg-slate-900/5' : 'border-slate-200 bg-slate-50'} ${aspectClass} flex items-center justify-center`}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2 p-4 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
            <span className="text-xs">Saving &amp; securing image...</span>
          </div>
        ) : isCameraActive ? (
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-amber-600"
              >
                <Camera className="h-4 w-4" /> Take Snap
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full bg-slate-800/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : value ? (
          <div className="group relative h-full w-full">
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={startCamera}
                className="rounded bg-white/90 p-2 text-slate-800 shadow transition hover:bg-white"
                title="Retake with Camera"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-white/90 p-2 text-slate-800 shadow transition hover:bg-white"
                title="Replace with File"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="rounded bg-rose-600 p-2 text-white shadow transition hover:bg-rose-700"
                title="Remove Image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 p-4 text-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Camera className="h-3.5 w-3.5 text-amber-600" /> Use Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Upload className="h-3.5 w-3.5 text-blue-600" /> Upload File
              </button>
            </div>
            <p className="text-[11px] text-slate-600">JPG, PNG, WebP up to 15MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
