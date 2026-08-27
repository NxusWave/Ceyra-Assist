interface CeyraLogoProps {
  className?: string;
  size?: number;
}

export default function CeyraLogo({ className = 'w-8 h-8', size }: CeyraLogoProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} style={style}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
      >
        <defs>
          <linearGradient id="ceyra-hub-grad" x1="50%" y1="0%" x2="25%" y2="100%">
            <stop offset="0%" stopColor="#2590FA" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="65%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* 5 Radial Connecting Spokes */}
        <g stroke="url(#ceyra-hub-grad)" strokeWidth="8" strokeLinecap="round" opacity="0.9">
          {/* Top spoke */}
          <line x1="50" y1="50" x2="50" y2="24" />
          {/* Top-Right spoke */}
          <line x1="50" y1="50" x2="75" y2="42" />
          {/* Bottom-Right spoke */}
          <line x1="50" y1="50" x2="65.5" y2="72" />
          {/* Bottom-Left spoke */}
          <line x1="50" y1="50" x2="34.5" y2="72" />
          {/* Top-Left spoke */}
          <line x1="50" y1="50" x2="25" y2="42" />
        </g>

        {/* Central Hub Ring */}
        <circle
          cx="50"
          cy="50"
          r="10"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />

        {/* 5 Outer Circular Rings */}
        {/* Node 1: Top */}
        <circle
          cx="50"
          cy="24"
          r="11"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />
        {/* Node 2: Top Right */}
        <circle
          cx="75"
          cy="42"
          r="11"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />
        {/* Node 3: Bottom Right */}
        <circle
          cx="65.5"
          cy="72"
          r="11"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />
        {/* Node 4: Bottom Left */}
        <circle
          cx="34.5"
          cy="72"
          r="11"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />
        {/* Node 5: Top Left */}
        <circle
          cx="25"
          cy="42"
          r="11"
          stroke="url(#ceyra-hub-grad)"
          strokeWidth="8.5"
          fill="transparent"
        />
      </svg>
    </div>
  );
}
