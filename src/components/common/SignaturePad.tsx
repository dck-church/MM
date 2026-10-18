import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Upload } from 'lucide-react';
import { api } from '../../services/api';

interface SignaturePadProps {
  label: string;
  signatoryName?: string;
  signatoryRole?: string;
  value?: string;
  onChange: (url: string) => void;
  staffName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  signatoryName,
  signatoryRole = 'Borrower',
  value,
  onChange,
  staffName = 'Credit Officer',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI scale
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (value) return; // already saved
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onChange('');
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setTimestamp(new Date().toISOString());

    try {
      const res = await api.uploadFile(dataUrl, `sig_${signatoryRole.toLowerCase()}`, 'signature');
      onChange(res.url || dataUrl);
    } catch {
      onChange(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        try {
          const res = await api.uploadFile(reader.result, file.name, 'signature');
          onChange(res.url || reader.result);
          setTimestamp(new Date().toISOString());
        } catch {
          onChange(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <PenTool className="h-3.5 w-3.5 text-amber-600" /> {label}
          </h4>
          {signatoryName && (
            <p className="text-[11px] text-slate-500">
              Signatory: <strong className="text-slate-700">{signatoryName}</strong> ({signatoryRole})
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!value && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
              title="Upload scanned signature"
            >
              <Upload className="h-3 w-3" /> Upload Scan
            </button>
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

      <div className="relative h-32 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-50/50">
        {value ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-2">
            <img src={value} alt="Signature Preview" className="max-h-20 object-contain" />
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
              <Check className="h-3 w-3" /> Digitally recorded &amp; sealed
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        )}

        <div className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-slate-600">
          Sign inside the box using stylus, mouse, or touch
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <div>
          Witnessing Officer: <span className="font-semibold text-slate-700">{staffName}</span>
        </div>
        <div className="flex items-center gap-2">
          {!value && hasDrawn && (
            <>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 rounded px-2 py-1 font-medium text-rose-600 hover:bg-rose-50"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <Check className="h-3 w-3" /> Confirm Signature
              </button>
            </>
          )}
          {value && (
            <button
              type="button"
              onClick={clearCanvas}
              className="text-slate-500 hover:text-rose-600 text-[11px] underline"
            >
              Clear &amp; Re-sign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
