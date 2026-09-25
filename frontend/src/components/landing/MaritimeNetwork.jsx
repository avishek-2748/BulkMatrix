import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

// Port data for Australia → India bulk corridor
const PORTS = [
  { id: 'haypoint', name: 'Hay Point', x: 82, y: 62, type: 'origin' },
  { id: 'newcastle', name: 'Newcastle', x: 87, y: 71, type: 'origin' },
  { id: 'gladstone', name: 'Gladstone', x: 83, y: 58, type: 'origin' },
  { id: 'paradip', name: 'Paradip', x: 34, y: 36, type: 'destination' },
  { id: 'vizag', name: 'Visakhapatnam', x: 33, y: 40, type: 'destination' },
  { id: 'gangavaram', name: 'Gangavaram', x: 32, y: 41, type: 'destination' },
];

const ROUTE_PATH = "M 82,62 C 70,55 55,45 40,38 Q 36,37 34,36";
const ROUTE_PATH2 = "M 83,58 C 72,52 58,44 44,40 Q 38,39 32,41";

const MaritimeNetwork = () => {
  const svgRef = useRef(null);
  const vesselRef = useRef(null);
  const vessel2Ref = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    ctxRef.current = gsap.context(() => {
      // Fade in the entire SVG
      gsap.from(svgRef.current, { opacity: 0, duration: 1.2, ease: 'power2.out', delay: 0.2 });

      // Animate route line drawing
      const route1 = svgRef.current?.querySelector('#route1');
      const route2 = svgRef.current?.querySelector('#route2');
      if (route1) {
        const len = route1.getTotalLength?.() || 400;
        gsap.set(route1, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(route1, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.5 });
      }
      if (route2) {
        const len2 = route2.getTotalLength?.() || 400;
        gsap.set(route2, { strokeDasharray: len2, strokeDashoffset: len2 });
        gsap.to(route2, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.8 });
      }

      // Vessel 1 continuous travel
      if (vesselRef.current && route1) {
        gsap.to(vesselRef.current, {
          motionPath: {
            path: route1,
            align: route1,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: 18,
          repeat: -1,
          ease: 'none',
          delay: 2.8,
        });
        gsap.from(vesselRef.current, { opacity: 0, duration: 0.5, delay: 2.8 });
      }

      // Vessel 2 continuous travel on route 2
      if (vessel2Ref.current && route2) {
        gsap.to(vessel2Ref.current, {
          motionPath: {
            path: route2,
            align: route2,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: 22,
          repeat: -1,
          ease: 'none',
          delay: 7,
        });
        gsap.from(vessel2Ref.current, { opacity: 0, duration: 0.5, delay: 7 });
      }

      // Port pulse animations
      svgRef.current?.querySelectorAll('.port-pulse').forEach((el, i) => {
        gsap.to(el, {
          scale: 1.8,
          opacity: 0,
          duration: 1.8,
          repeat: -1,
          ease: 'power2.out',
          delay: i * 0.4,
          transformOrigin: 'center',
        });
      });
    }, svgRef);

    return () => ctxRef.current?.revert();
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', opacity: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="lightOceanGrad" cx="65%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#EAF6FB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="portHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38C6D8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38C6D8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle light ocean wash */}
        <rect width="100" height="100" fill="url(#lightOceanGrad)" />

        {/* Latitude/longitude enterprise grid lines */}
        {[20, 35, 50, 65, 80].map((y) => (
          <line
            key={`lat-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#D9E5EC"
            strokeWidth="0.12"
            opacity="0.8"
            strokeDasharray="1.5,3"
          />
        ))}
        {[15, 30, 45, 60, 75, 90].map((x) => (
          <line
            key={`lon-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="100"
            stroke="#D9E5EC"
            strokeWidth="0.12"
            opacity="0.8"
            strokeDasharray="1.5,3"
          />
        ))}

        {/* Continents: Australia (right) and Indian subcontinent (left) in #EAF6FB with #CFE0EA border */}
        {/* Australia */}
        <path
          d="M 68,52 Q 72,48 78,50 Q 84,52 88,56 Q 92,62 90,68 Q 88,74 84,76 Q 80,78 76,74 Q 72,70 70,66 Q 68,60 68,52 Z"
          fill="#EAF6FB"
          stroke="#CFE0EA"
          strokeWidth="0.35"
        />
        {/* Tasmania */}
        <path
          d="M 82,78 Q 84,77 86,79 Q 85,82 83,81 Z"
          fill="#EAF6FB"
          stroke="#CFE0EA"
          strokeWidth="0.25"
        />

        {/* Indian subcontinent */}
        <path
          d="M 25,24 Q 30,22 36,24 Q 40,28 40,34 Q 38,38 35,42 Q 32,46 30,48 Q 27,44 25,40 Q 23,34 23,28 Z"
          fill="#EAF6FB"
          stroke="#CFE0EA"
          strokeWidth="0.35"
        />
        {/* Sri Lanka */}
        <path
          d="M 36,49 Q 37,48 38,49 Q 37.5,51 36.5,51 Z"
          fill="#EAF6FB"
          stroke="#CFE0EA"
          strokeWidth="0.25"
        />

        {/* Primary shipping route in Ocean Blue #087CC1 */}
        <path
          id="route1"
          d={ROUTE_PATH}
          fill="none"
          stroke="#087CC1"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Route halo */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#087CC1"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.12"
        />

        {/* Secondary route in Maritime Cyan #38C6D8 */}
        <path
          id="route2"
          d={ROUTE_PATH2}
          fill="none"
          stroke="#38C6D8"
          strokeWidth="0.3"
          strokeLinecap="round"
          opacity="0.75"
          strokeDasharray="1,1"
        />

        {/* Port nodes */}
        {PORTS.map((port) => (
          <g key={port.id}>
            {/* Pulse ring */}
            <circle
              className="port-pulse"
              cx={port.x}
              cy={port.y}
              r={port.type === 'origin' ? 1.3 : 1.1}
              fill="none"
              stroke="#38C6D8"
              strokeWidth="0.3"
              opacity="0.6"
            />
            {/* Core node */}
            <circle
              cx={port.x}
              cy={port.y}
              r={port.type === 'origin' ? 0.75 : 0.6}
              fill="#087CC1"
              stroke="#FFFFFF"
              strokeWidth="0.2"
            />
            {/* Port label */}
            <text
              x={port.x + (port.type === 'origin' ? 1.4 : -1.4)}
              y={port.y - 0.6}
              fontSize="1.3"
              fontWeight="600"
              fill="#40566D"
              fontFamily="Inter, sans-serif"
              textAnchor={port.type === 'origin' ? 'start' : 'end'}
            >
              {port.name}
            </text>
          </g>
        ))}

        {/* Radial zone around destination port */}
        <circle cx="34" cy="36" r="4.5" fill="url(#portHighlight)" stroke="#38C6D8" strokeWidth="0.15" opacity="0.6" />
        <circle cx="34" cy="36" r="7.5" fill="none" stroke="#087CC1" strokeWidth="0.1" opacity="0.35" strokeDasharray="0.8,1.2" />

        {/* Vessel marker 1: active bulk carrier in Ocean Blue with Orange detail */}
        <g ref={vesselRef} style={{ opacity: 0 }}>
          <polygon
            points="0,-1.4 0.8,0.7 0,0.3 -0.8,0.7"
            fill="#087CC1"
            stroke="#132B4F"
            strokeWidth="0.18"
          />
          <circle cx="0" cy="0" r="0.25" fill="#FF7628" />
        </g>

        {/* Vessel marker 2: secondary vessel */}
        <g ref={vessel2Ref} style={{ opacity: 0 }}>
          <polygon
            points="0,-1.1 0.6,0.5 0,0.2 -0.6,0.5"
            fill="#38C6D8"
            stroke="#087CC1"
            strokeWidth="0.15"
          />
        </g>
      </svg>
    </div>
  );
};

export default MaritimeNetwork;
