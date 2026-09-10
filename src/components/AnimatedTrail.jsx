/**
 * AnimatedTrail — An SVG overlay of a dotted trekking path
 * that animates like a hiker walking along the trail.
 * Inspired by the TrailGuard logo's mountain trek path.
 */
export default function AnimatedTrail() {
  return (
    <div className="animated-trail-container" aria-hidden="true">
      <svg
        viewBox="0 0 1200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        {/* Trek trail path 1 — main winding path */}
        <path
          d="M-20 280 Q100 250 180 220 Q260 180 320 160 Q400 130 450 170 Q520 220 580 190 Q650 150 720 120 Q800 80 860 110 Q940 150 1000 100 Q1060 60 1120 80 Q1180 100 1220 60"
          stroke="rgba(77, 184, 94, 0.25)"
          strokeWidth="2"
          strokeDasharray="6 10"
          className="trail-path trail-path-1"
        />

        {/* Trek trail path 2 — secondary path */}
        <path
          d="M-20 260 Q80 230 160 250 Q260 270 340 230 Q420 190 500 210 Q580 240 660 200 Q740 160 820 180 Q900 200 980 150 Q1060 100 1140 120 Q1200 130 1220 100"
          stroke="rgba(114, 208, 128, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 12"
          className="trail-path trail-path-2"
        />

        {/* Trek trail path 3 — high altitude path */}
        <path
          d="M-20 200 Q120 170 200 140 Q300 100 380 130 Q460 160 540 120 Q620 70 700 90 Q780 110 860 60 Q940 20 1020 50 Q1100 80 1220 30"
          stroke="rgba(219, 184, 144, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="3 14"
          className="trail-path trail-path-3"
        />

        {/* Animated hiker dot on trail 1 */}
        <circle r="4" fill="#4db85e" opacity="0.8" className="trail-dot">
          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            path="M-20 280 Q100 250 180 220 Q260 180 320 160 Q400 130 450 170 Q520 220 580 190 Q650 150 720 120 Q800 80 860 110 Q940 150 1000 100 Q1060 60 1120 80 Q1180 100 1220 60"
          />
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="18s" repeatCount="indefinite" />
        </circle>

        {/* Glow trail behind hiker dot */}
        <circle r="8" fill="#4db85e" opacity="0.15" className="trail-glow">
          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            path="M-20 280 Q100 250 180 220 Q260 180 320 160 Q400 130 450 170 Q520 220 580 190 Q650 150 720 120 Q800 80 860 110 Q940 150 1000 100 Q1060 60 1120 80 Q1180 100 1220 60"
          />
          <animate attributeName="opacity" values="0;0.2;0.2;0" dur="18s" repeatCount="indefinite" />
        </circle>

        {/* Second hiker dot on trail 2, offset timing */}
        <circle r="3" fill="#dbb890" opacity="0.6" className="trail-dot">
          <animateMotion
            dur="24s"
            repeatCount="indefinite"
            path="M-20 260 Q80 230 160 250 Q260 270 340 230 Q420 190 500 210 Q580 240 660 200 Q740 160 820 180 Q900 200 980 150 Q1060 100 1140 120 Q1200 130 1220 100"
          />
          <animate attributeName="opacity" values="0;0.6;0.6;0" dur="24s" repeatCount="indefinite" />
        </circle>

        {/* Tiny checkpoint markers along main trail */}
        <g opacity="0.3">
          <circle cx="180" cy="220" r="3" fill="#fbbf24" />
          <circle cx="450" cy="170" r="3" fill="#fbbf24" />
          <circle cx="720" cy="120" r="3" fill="#fbbf24" />
          <circle cx="1000" cy="100" r="3" fill="#fbbf24" />
        </g>

        {/* Checkpoint flags */}
        <g opacity="0.2">
          <line x1="180" y1="220" x2="180" y2="208" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="180,208 192,212 180,216" fill="#fbbf24" />

          <line x1="720" y1="120" x2="720" y2="108" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="720,108 732,112 720,116" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  )
}
