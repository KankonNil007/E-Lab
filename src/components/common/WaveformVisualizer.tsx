import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Play, Pause, RotateCcw } from 'lucide-react';

export interface WaveformVisualizerProps {
  waveformType?: 'sine' | 'cosine' | 'square' | 'triangle' | 'sawtooth' | 'impulse' | 'step' | 'ramp' | 'noise';
  frequency?: number; // in Hz
  amplitude?: number; // in Volts peak
  offset?: number;    // in Volts DC
  color?: string;     // trace color (e.g. '#06B6D4')
  interactive?: boolean;
  className?: string;
  showReadouts?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveformType = 'sine',
  frequency = 2,
  amplitude = 2.5,
  offset = 0,
  color = '#06B6D4',
  interactive = true,
  className,
  showReadouts = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const phaseRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Readouts
  const periodMs = frequency > 0 ? (1000 / frequency).toFixed(2) : '0';
  const vpp = (amplitude * 2).toFixed(2);
  const vrms = (amplitude * 0.7071).toFixed(2);

  const resetPhase = useCallback(() => {
    phaseRef.current = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastTimeRef.current = null;

    const render = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05); // cap at 50ms to prevent jumping
      lastTimeRef.current = currentTime;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) {
        if (isRunning) {
          animationFrameId.current = requestAnimationFrame(render);
        }
        return;
      }

      // Synchronize backing buffer size to avoid scaling distortion
      const targetBufferW = Math.round(width * dpr);
      const targetBufferH = Math.round(height * dpr);
      if (canvas.width !== targetBufferW || canvas.height !== targetBufferH) {
        canvas.width = targetBufferW;
        canvas.height = targetBufferH;
      }

      // Reset transform matrix and apply 1:1 CSS pixel scaling
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Oscilloscope screen background
      ctx.fillStyle = '#0a1014';
      ctx.fillRect(0, 0, width, height);

      // Oscilloscope grid (10 columns, 8 rows)
      const gridCols = 10;
      const gridRows = 8;
      const colStep = width / gridCols;
      const rowStep = height / gridRows;

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';

      ctx.beginPath();
      for (let i = 0; i <= gridCols; i++) {
        const x = Math.round(i * colStep);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let j = 0; j <= gridRows; j++) {
        const y = Math.round(j * rowStep);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center crosshair with measurement sub-ticks
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.lineWidth = 1;
      const midX = width / 2;
      const midY = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();

      // Sub-ticks along axes
      ctx.lineWidth = 0.75;
      const tickSize = 3;
      for (let x = 0; x <= width; x += colStep / 5) {
        ctx.beginPath();
        ctx.moveTo(x, midY - tickSize);
        ctx.lineTo(x, midY + tickSize);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += rowStep / 5) {
        ctx.beginPath();
        ctx.moveTo(midX - tickSize, y);
        ctx.lineTo(midX + tickSize, y);
        ctx.stroke();
      }

      // Draw Waveform trace in CSS logical coordinate space
      const centerY = midY - (offset / 5) * (height / 2);
      const scaleY = (height / 8) * (amplitude / 2);

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      const cyclesToDisplay = 2.5;
      const totalPoints = Math.max(10, Math.floor(width));

      for (let px = 0; px <= totalPoints; px++) {
        const t = (px / width) * (cyclesToDisplay * 2 * Math.PI) + phaseRef.current;
        let yNorm = 0;

        switch (waveformType) {
          case 'sine':
            yNorm = Math.sin(t);
            break;
          case 'cosine':
            yNorm = Math.cos(t);
            break;
          case 'square':
            yNorm = Math.sin(t) >= 0 ? 1 : -1;
            break;
          case 'triangle':
            yNorm = (2 / Math.PI) * Math.asin(Math.sin(t));
            break;
          case 'sawtooth':
            yNorm = 2 * ((t / (2 * Math.PI)) - Math.floor(0.5 + t / (2 * Math.PI)));
            break;
          case 'impulse': {
            const normT = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            yNorm = normT < 0.25 ? 1.0 : 0.0;
            break;
          }
          case 'step': {
            const normT = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            yNorm = normT < Math.PI ? 1.0 : 0.0;
            break;
          }
          case 'ramp': {
            const normT = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            yNorm = (normT / (2 * Math.PI)) * 2 - 1;
            break;
          }
          case 'noise':
            yNorm = (Math.sin(t) * 0.7) + ((Math.random() - 0.5) * 0.6);
            break;
        }

        const py = centerY - yNorm * scaleY;
        if (px === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Advance phase continuously based on real elapsed time
      if (isRunning) {
        phaseRef.current += 2 * Math.PI * frequency * dt * 0.25;
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [waveformType, frequency, amplitude, offset, color, isRunning]);

  return (
    <div
      ref={containerRef}
      className={cn('relative flex flex-col rounded-xl overflow-hidden border border-cyan-950/60 bg-[#070d10] shadow-inner', className)}
    >
      {/* Oscilloscope Header / Readout bar */}
      {showReadouts && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b1418] border-b border-cyan-950/60 text-[11px] font-mono text-cyan-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600')} />
              <span className="font-semibold text-zinc-200 uppercase">{waveformType} CH1</span>
            </span>
            <span className="text-zinc-500">|</span>
            <span>f: <strong className="text-zinc-200">{frequency} Hz</strong></span>
            <span className="text-zinc-500">|</span>
            <span>T: <strong className="text-zinc-200">{periodMs} ms</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>Vpp: <strong className="text-zinc-200">{vpp} V</strong></span>
            <span>Vrms: <strong className="text-zinc-200">{vrms} V</strong></span>
            {interactive && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="p-1 rounded hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-100 transition-colors"
                  title={isRunning ? 'Pause Sweep' : 'Resume Sweep'}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={resetPhase}
                  className="p-1 rounded hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-100 transition-colors"
                  title="Reset Trigger"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas view area */}
      <div className="relative w-full h-full min-h-[160px] flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
