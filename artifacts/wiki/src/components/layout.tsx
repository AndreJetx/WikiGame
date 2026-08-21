import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./navbar";

export function SpiritualBackground() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/20 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float-up ${p.duration}s infinite linear ${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px var(--primary)`
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}

export function Layout({
  children,
  withSidebar = false,
  hideFooter = false,
  fullWidth = false,
}: {
  children: ReactNode;
  withSidebar?: boolean;
  hideFooter?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 relative">
      <SpiritualBackground />
      <Navbar />
      <main
        className={
          fullWidth
            ? "flex-1 flex w-full"
            : "flex-1 flex w-full max-w-screen-2xl mx-auto"
        }
      >
        {children}
      </main>
      {!hideFooter && (
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground mt-auto relative z-10 bg-background/80 backdrop-blur-sm">
          <p>Legend of Elements Wiki &copy; 2025. This is a mystical realm.</p>
        </footer>
      )}
    </div>
  );
}
