/**
 * BrickStack - SVG brick wall illustration for hero section
 * Clean, professional, animatable
 */

const BrickStack = ({ className = '' }) => {
  return (
    <svg
      width="180"
      height="156"
      viewBox="0 0 180 156"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Row 1 - Top */}
      <rect x="0" y="0" width="70" height="32" rx="4" fill="#c54b1a" className="brick brick-1" />
      <rect x="78" y="0" width="70" height="32" rx="4" fill="#3d1a1a" className="brick brick-2" />
      
      {/* Row 2 - Offset */}
      <rect x="30" y="40" width="70" height="32" rx="4" fill="#3d1a1a" className="brick brick-3" />
      <rect x="108" y="40" width="70" height="32" rx="4" fill="#c54b1a" className="brick brick-4" />
      
      {/* Row 3 */}
      <rect x="0" y="80" width="70" height="32" rx="4" fill="#c54b1a" className="brick brick-5" />
      <rect x="78" y="80" width="70" height="32" rx="4" fill="#3d1a1a" className="brick brick-6" />
      
      {/* Row 4 - Bottom offset */}
      <rect x="30" y="120" width="70" height="32" rx="4" fill="#3d1a1a" className="brick brick-7" />
      <rect x="108" y="120" width="70" height="32" rx="4" fill="#c54b1a" className="brick brick-8" />
      
      {/* Subtle highlights for depth */}
      <rect x="0" y="0" width="70" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="78" y="0" width="70" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="30" y="40" width="70" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="108" y="40" width="70" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="0" y="80" width="70" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="78" y="80" width="70" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="30" y="120" width="70" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="108" y="120" width="70" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
    </svg>
  );
};

export default BrickStack;