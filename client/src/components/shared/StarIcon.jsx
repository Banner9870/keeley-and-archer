/**
 * StarIcon — Chicago six-pointed star (hexagram / Star of David geometry).
 * Two overlapping equilateral triangles forming a regular hexagram.
 * Used as the Chicago flag star motif throughout the design system.
 */
export default function StarIcon({ size = 16, color = 'currentColor', className, 'aria-hidden': ariaHidden = true }) {
  // Regular hexagram: outer points at 60° intervals, inner ring at 30° offsets
  // Built as two overlapping equilateral triangles inscribed in a circle
  // Points of triangle 1 (0°, 120°, 240°) and triangle 2 (60°, 180°, 300°)
  const r = 10; // outer radius
  const cx = 12;
  const cy = 12;

  const point = (angleDeg, radius) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };

  // Triangle 1: pointing up (0°, 120°, 240°)
  const t1 = [0, 120, 240].map(a => point(a, r));
  // Triangle 2: pointing down (60°, 180°, 300°)
  const t2 = [60, 180, 300].map(a => point(a, r));

  const polyPoints = pts => pts.map(p => p.join(',')).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaHidden}
      role="img"
    >
      <polygon points={polyPoints(t1)} />
      <polygon points={polyPoints(t2)} />
    </svg>
  );
}
