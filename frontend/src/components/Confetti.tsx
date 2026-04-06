import { useMemo } from "react";

interface ConfettiProps {
  show: boolean;
}

interface ConfettiItem {
  id: number;
  delay: string;
  x: string;
  color: string;
}

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#d97706'];

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const Confetti = ({ show }: ConfettiProps) => {
  const confettiItems = useMemo<ConfettiItem[]>(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      delay: `${seededRandom(i * 3) * 2}s`,
      x: `${seededRandom(i * 7) * 100}vw`,
      color: COLORS[Math.floor(seededRandom(i * 11) * COLORS.length)],
    }));
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="confetti-container" aria-hidden="true">
        {confettiItems.map((item) => (
          <div
            key={item.id}
            className="confetti"
            style={{
              '--delay': item.delay,
              '--x': item.x,
              '--color': item.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};