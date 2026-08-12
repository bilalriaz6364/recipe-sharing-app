import { useEffect, useRef } from 'react';

export default function SmokyCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 65;

    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
    };

    let moveTimeout;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isMoving = true;

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        mouse.isMoving = false;
      }, 150);

      if (Math.random() < 0.8) {
        addParticle(mouse.targetX, mouse.targetY);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isMoving = true;

        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          mouse.isMoving = false;
        }, 150);

        if (Math.random() < 0.8) {
          addParticle(mouse.targetX, mouse.targetY);
        }
      }
    };

    function addParticle(x, y) {
      if (particles.length > maxParticles) {
        particles.shift();
      }

      // Alternate colors between emerald green, warm champagne gold, and soft smoke white
      const colorChoices = [
        { r: 52, g: 211, b: 153 },  // Emerald 400
        { r: 16, g: 185, b: 129 },  // Emerald 500
        { r: 251, g: 191, b: 36 },  // Amber/Gold 400
        { r: 226, g: 232, b: 240 }, // Soft Slate/Smoke White
      ];
      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];

      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.5 - 0.5,
        size: Math.random() * 22 + 12,
        maxSize: Math.random() * 45 + 30,
        alpha: 0.45,
        decay: Math.random() * 0.012 + 0.008,
        color,
        spin: (Math.random() - 0.5) * 0.03,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse ease interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.2;
      mouse.y += (mouse.targetY - mouse.y) * 0.2;

      // Draw subtle ambient mouse aura glow
      const cursorGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        90
      );
      cursorGlow.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      cursorGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
      cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.fill();

      // Render smoky particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.size += (p.maxSize - p.size) * 0.03;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        radGrad.addColorStop(
          0,
          `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`
        );
        radGrad.addColorStop(
          0.6,
          `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.4})`
        );
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
