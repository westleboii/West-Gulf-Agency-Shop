import React from 'react';
import { type VisualArchetype } from '../utils/shopLogic';

interface ProductVisualProps {
  archetype: VisualArchetype;
  className?: string;
  title?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  archetype,
  className = 'w-full h-full',
  title = 'West Gulf Luxury Item',
}) => {
  const renderArtwork = () => {
    switch (archetype) {
      case 'ebike':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <defs>
              <linearGradient id="bg-ebike" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#18181B" />
                <stop offset="100%" stopColor="#27272A" />
              </linearGradient>
              <linearGradient id="gold-rim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#9A7B2C" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#bg-ebike)" />
            <ellipse cx="200" cy="245" rx="145" ry="12" fill="#09090B" opacity="0.6" />
            {/* Wheels */}
            <circle cx="115" cy="195" r="46" fill="none" stroke="#52525B" strokeWidth="10" />
            <circle cx="115" cy="195" r="39" fill="none" stroke="url(#gold-rim)" strokeWidth="2.5" />
            <circle cx="115" cy="195" r="8" fill="#D4AF37" />
            <circle cx="285" cy="195" r="46" fill="none" stroke="#52525B" strokeWidth="10" />
            <circle cx="285" cy="195" r="39" fill="none" stroke="url(#gold-rim)" strokeWidth="2.5" />
            <circle cx="285" cy="195" r="8" fill="#D4AF37" />
            {/* Carbon Monocoque Frame */}
            <path
              d="M115 195 L175 130 L260 125 L200 195 Z"
              fill="none"
              stroke="#E4E4E7"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            {/* Battery Pack */}
            <path d="M182 138 L244 134 L212 182 L195 182 Z" fill="#D4AF37" opacity="0.88" />
            {/* Fork & Handlebars */}
            <path d="M285 195 L252 102 L272 96" fill="none" stroke="#F4F4F5" strokeWidth="7" strokeLinecap="round" />
            {/* Seatpost & Saddle */}
            <path d="M175 130 L162 100" stroke="#F4F4F5" strokeWidth="6" strokeLinecap="round" />
            <path d="M145 98 L182 98" stroke="#D4AF37" strokeWidth="7" strokeLinecap="round" />
            {/* LED Headlight Beam */}
            <polygon points="266,105 355,80 355,130" fill="#FDE68A" opacity="0.18" />
          </svg>
        );

      case 'golfcart':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <rect width="400" height="300" fill="#F3EFEA" />
            <rect y="230" width="400" height="70" fill="#E6DFD5" />
            <ellipse cx="200" cy="238" rx="150" ry="12" fill="#18181B" opacity="0.15" />
            {/* Canopy Roof */}
            <path d="M85 78 L305 78 L315 90 L75 90 Z" fill="#18181B" />
            <line x1="105" y1="90" x2="115" y2="165" stroke="#27272A" strokeWidth="5" />
            <line x1="285" y1="90" x2="295" y2="155" stroke="#27272A" strokeWidth="5" />
            {/* Body Chassis */}
            <path d="M80 165 L290 165 L325 195 L320 215 L75 215 Z" fill="#18181B" />
            <path d="M90 172 L280 172 L295 186 L90 186 Z" fill="#B48A3E" />
            {/* Quilted Leather Seats */}
            <rect x="115" y="135" width="45" height="32" rx="6" fill="#92400E" />
            <rect x="195" y="135" width="45" height="32" rx="6" fill="#92400E" />
            {/* Lifted Alloy Wheels */}
            <circle cx="120" cy="218" r="28" fill="#18181B" stroke="#44403C" strokeWidth="6" />
            <circle cx="120" cy="218" r="14" fill="#D4AF37" />
            <circle cx="280" cy="218" r="28" fill="#18181B" stroke="#44403C" strokeWidth="6" />
            <circle cx="280" cy="218" r="14" fill="#D4AF37" />
          </svg>
        );

      case 'smartphone':
      case 'charger':
      case 'drone':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <rect width="400" height="300" fill="#1C1917" />
            <circle cx="200" cy="150" r="110" fill="#292524" />
            {archetype === 'smartphone' ? (
              <>
                <rect x="145" y="42" width="110" height="216" rx="18" fill="#27272A" stroke="#D4AF37" strokeWidth="3" />
                <rect x="153" y="52" width="94" height="196" rx="12" fill="#09090B" />
                <circle cx="176" cy="76" r="11" fill="#18181B" stroke="#D4AF37" strokeWidth="2" />
                <circle cx="176" cy="104" r="11" fill="#18181B" stroke="#D4AF37" strokeWidth="2" />
                <circle cx="202" cy="90" r="9" fill="#18181B" stroke="#A1A1AA" strokeWidth="1.5" />
                <path d="M165 185 Q200 140 235 185" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.7" />
              </>
            ) : (
              <>
                <rect x="125" y="95" width="150" height="115" rx="16" fill="#27272A" stroke="#D4AF37" strokeWidth="2.5" />
                <rect x="145" y="115" width="110" height="36" rx="6" fill="#09090B" />
                <text x="200" y="139" textAnchor="middle" fill="#FDE68A" fontSize="16" fontFamily="monospace">
                  240W GaN
                </text>
                <rect x="152" y="168" width="18" height="24" rx="3" fill="#D4AF37" />
                <rect x="182" y="168" width="18" height="24" rx="3" fill="#D4AF37" />
                <rect x="212" y="168" width="18" height="24" rx="3" fill="#D4AF37" />
                <rect x="242" y="168" width="14" height="24" rx="3" fill="#A1A1AA" />
              </>
            )}
          </svg>
        );

      case 'sauna':
      case 'showerhead':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <rect width="400" height="300" fill="#EFECE6" />
            <rect y="235" width="400" height="65" fill="#E2DDD3" />
            {archetype === 'sauna' ? (
              <>
                {/* Cedar Infrared Sauna Cabin */}
                <rect x="125" y="38" width="150" height="210" rx="6" fill="#9A5B32" stroke="#5C3419" strokeWidth="4" />
                <rect x="138" y="52" width="78" height="182" rx="3" fill="#291D18" stroke="#D4AF37" strokeWidth="2" />
                {/* Red Light Therapy Glow */}
                <rect x="144" y="58" width="66" height="170" fill="#EA580C" opacity="0.35" />
                <line x1="232" y1="52" x2="232" y2="234" stroke="#7C4726" strokeWidth="2" />
                <line x1="252" y1="52" x2="252" y2="234" stroke="#7C4726" strokeWidth="2" />
                <rect x="220" y="130" width="8" height="28" rx="2" fill="#D4AF37" />
              </>
            ) : (
              <>
                {/* Brushed Brass Rainfall & Filtered Shower System */}
                <path d="M140 245 L140 65 Q140 42 168 42 L245 42 L245 68" fill="none" stroke="#C59B27" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="245" cy="74" rx="52" ry="12" fill="#D4AF37" stroke="#9A7B2C" strokeWidth="3" />
                {/* Vitamin C Filter Capsule */}
                <rect x="127" y="135" width="26" height="54" rx="8" fill="#FDE68A" stroke="#B48A3E" strokeWidth="3" />
                {/* Micro-mist Water Streams */}
                <line x1="210" y1="92" x2="202" y2="230" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 6" />
                <line x1="232" y1="94" x2="228" y2="230" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 6" />
                <line x1="255" y1="94" x2="258" y2="230" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 6" />
                <line x1="278" y1="92" x2="286" y2="230" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 6" />
              </>
            )}
          </svg>
        );

      case 'whipped-cream':
      case 'sofa':
      case 'chair':
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <rect width="400" height="300" fill="#F5F2EB" />
            <rect y="225" width="400" height="75" fill="#E6E0D4" />
            {archetype === 'whipped-cream' ? (
              <>
                <ellipse cx="200" cy="235" rx="58" ry="10" fill="#18181B" opacity="0.15" />
                <rect x="156" y="88" width="88" height="145" rx="22" fill="#D4D4D8" stroke="#71717A" strokeWidth="3" />
                <rect x="168" y="56" width="64" height="34" rx="8" fill="#27272A" />
                <path d="M232 68 L268 52 L274 62 L232 78 Z" fill="#D4AF37" />
                <path d="M168 65 L136 82" stroke="#D4AF37" strokeWidth="7" strokeLinecap="round" />
                <rect x="166" y="138" width="68" height="34" rx="4" fill="#18181B" />
                <text x="200" y="159" textAnchor="middle" fill="#D4AF37" fontSize="11" fontFamily="monospace">
                  CHEFCREMA 1L
                </text>
              </>
            ) : archetype === 'sofa' ? (
              <>
                <ellipse cx="200" cy="232" rx="155" ry="12" fill="#18181B" opacity="0.12" />
                {/* Modular Boucle Backrest */}
                <rect x="65" y="118" width="270" height="68" rx="24" fill="#FAF8F5" stroke="#D6D3CD" strokeWidth="3" />
                {/* Modular Cushions */}
                <rect x="55" y="162" width="95" height="58" rx="18" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2.5" />
                <rect x="152" y="162" width="96" height="58" rx="18" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2.5" />
                <rect x="250" y="162" width="95" height="58" rx="18" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2.5" />
                {/* Arms */}
                <rect x="42" y="140" width="32" height="80" rx="14" fill="#F4F1EA" stroke="#D6D3CD" strokeWidth="2.5" />
                <rect x="326" y="140" width="32" height="80" rx="14" fill="#F4F1EA" stroke="#D6D3CD" strokeWidth="2.5" />
              </>
            ) : (
              <>
                {/* Sculptural Walnut & Leather Chair */}
                <ellipse cx="200" cy="235" rx="95" ry="10" fill="#18181B" opacity="0.15" />
                <path d="M125 90 Q200 75 275 90 L260 185 Q200 198 140 185 Z" fill="#78350F" stroke="#451A03" strokeWidth="4" />
                <rect x="136" y="150" width="128" height="36" rx="14" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
                <line x1="155" y1="186" x2="135" y2="232" stroke="#451A03" strokeWidth="7" strokeLinecap="round" />
                <line x1="245" y1="186" x2="265" y2="232" stroke="#451A03" strokeWidth="7" strokeLinecap="round" />
              </>
            )}
          </svg>
        );

      default:
        // High-End Seasonal Fashion (Men, Women, Kids)
        return (
          <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label={title}>
            <rect width="400" height="300" fill="#F4EFE6" />
            {/* Travertine Arch Pedestal */}
            <path d="M115 260 L115 110 A85 85 0 0 1 285 110 L285 260 Z" fill="#E7DFD3" />
            {/* Brass Garment Stand */}
            <line x1="200" y1="55" x2="200" y2="255" stroke="#B48A3E" strokeWidth="4" />
            <line x1="155" y1="255" x2="245" y2="255" stroke="#B48A3E" strokeWidth="6" strokeLinecap="round" />
            <path d="M150 85 Q200 68 250 85" fill="none" stroke="#B48A3E" strokeWidth="4" strokeLinecap="round" />
            {/* Tailored Garment Silhouette */}
            {archetype === 'fashion-womens' ? (
              <path
                d="M152 84 L248 84 L272 232 L128 232 Z"
                fill="#1C1917"
                stroke="#D4AF37"
                strokeWidth="2.5"
              />
            ) : archetype === 'fashion-mens' ? (
              <path
                d="M148 84 L252 84 L258 198 L142 198 Z"
                fill="#D6C7B2"
                stroke="#78716C"
                strokeWidth="2.5"
              />
            ) : (
              <path
                d="M162 92 L238 92 L246 185 L154 185 Z"
                fill="#FAFAF9"
                stroke="#B48A3E"
                strokeWidth="2.5"
              />
            )}
            <line x1="200" y1="84" x2="200" y2="195" stroke="#D4AF37" strokeWidth="2" />
          </svg>
        );
    }
  };

  return <div className={`overflow-hidden select-none ${className}`}>{renderArtwork()}</div>;
};
