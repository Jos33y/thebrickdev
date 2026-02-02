/**
 * BrickMark - The Brick Dev Logo Mark
 * SVG logo component for header and footer
 */

const BrickMark = ({ className = '', size = 40 }) => {
  const scale = size / 40;
  const width = 48 * scale;
  const height = 40 * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="The Brick Dev logo"
    >
      {/* Top row - 2 orange bricks */}
      <rect x="0" y="0" width="16" height="10" rx="2.5" fill="#c54b1a" />
      <rect x="20" y="0" width="24" height="10" rx="2.5" fill="#c54b1a" />

      {/* Middle row - 2 dark bricks */}
      <rect x="0" y="14" width="10" height="10" rx="2.5" fill="#3d1a1a" />
      <rect x="14" y="14" width="34" height="10" rx="2.5" fill="#3d1a1a" />

      {/* Bottom row - 2 orange bricks */}
      <rect x="0" y="28" width="24" height="10" rx="2.5" fill="#c54b1a" />
      <rect x="28" y="28" width="16" height="10" rx="2.5" fill="#c54b1a" />
    </svg>
  );
};

export default BrickMark;
