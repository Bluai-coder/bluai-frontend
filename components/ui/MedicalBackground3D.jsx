'use client';
import { useEffect, useRef, useState } from 'react';

export default function MedicalBackground3D() {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let hexagons = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', resize);

    class Cell {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 40 + 10;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.5 ? 'rgba(27, 77, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.draw();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(27, 77, 255, 0.05)';
        ctx.stroke();
      }
    }

    // Molecular Hexagon
    class Hexagon {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 20 + 15;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.angle = Math.random() * Math.PI;
        this.spin = (Math.random() - 0.5) * 0.01;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spin;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.draw();
      }
      draw() {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const px = this.x + this.size * Math.cos(this.angle + i * Math.PI / 3);
          const py = this.y + this.size * Math.sin(this.angle + i * Math.PI / 3);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(27, 77, 255, 0.1)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      hexagons = [];
      const numCells = Math.floor((canvas.width * canvas.height) / 25000);
      const numHexes = Math.floor((canvas.width * canvas.height) / 40000);
      for (let i = 0; i < numCells; i++) particles.push(new Cell());
      for (let i = 0; i < numHexes; i++) hexagons.push(new Hexagon());
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update());
      hexagons.forEach(h => h.update());
      
      // Draw faint molecular connections between close hexagons
      for(let i=0; i<hexagons.length; i++) {
        for(let j=i+1; j<hexagons.length; j++) {
          const dx = hexagons[i].x - hexagons[j].x;
          const dy = hexagons[i].y - hexagons[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 150) {
            ctx.beginPath();
            ctx.moveTo(hexagons[i].x, hexagons[i].y);
            ctx.lineTo(hexagons[j].x, hexagons[j].y);
            ctx.strokeStyle = `rgba(27, 77, 255, ${(150 - dist) / 150 * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4f7fb] -z-10">
      
      {/* Clinical Medical Grid Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.4]"
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(27, 77, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(27, 77, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Subtle Vignette for depth (white edges to gray center, or vice versa) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#eef2f6_100%)]" />

      {/* Interactive Particle Canvas */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      </div>

      {/* Clean Clinical ECG Line */}
      <div className="absolute bottom-1/4 left-0 w-full h-24 opacity-40 flex items-center overflow-hidden z-0 pointer-events-none mix-blend-multiply">
        <svg className="w-[200%] h-full animate-slide" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <polyline 
            points="0,50 200,50 220,50 240,25 260,75 280,50 600,50 620,50 640,15 660,85 680,50 1000,50" 
            fill="none" 
            stroke="#1b4dff" 
            strokeWidth="2" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-slide {
          animation: slide 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
