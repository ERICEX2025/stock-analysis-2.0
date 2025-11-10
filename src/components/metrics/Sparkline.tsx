import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 100, height = 30, className }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 1) {
      // Single point
      ctx.fillStyle = 'currentColor';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 2, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    // Calculate min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Determine trend color
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const isPositive = lastValue > firstValue;
    const isNeutral = Math.abs(lastValue - firstValue) / firstValue < 0.01;

    // Set stroke color based on theme
    const isDark = document.documentElement.classList.contains('dark');
    if (isNeutral) {
      ctx.strokeStyle = isDark ? '#6b7280' : '#9ca3af';
    } else if (isPositive) {
      ctx.strokeStyle = isDark ? '#10b981' : '#16a34a';
    } else {
      ctx.strokeStyle = isDark ? '#ef4444' : '#dc2626';
    }

    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Calculate points
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw last point
    const lastPoint = points[points.length - 1];
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 1.5, 0, 2 * Math.PI);
    ctx.fill();
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('block', className)}
      aria-hidden="true"
    />
  );
}

