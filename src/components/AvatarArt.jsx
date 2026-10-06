import { useId } from 'react';

/** A simple illustrated portrait drawn from a character's palette and portrait kind. */
export function AvatarArt({ character, size = 'md' }) {
  // Unique per instance: the same character can appear several times on one page.
  const gradientId = `avatar-bg-${useId().replace(/:/g, '')}`;
  const palette = character?.palette || ['#734b3d', '#506b78', '#cf946e'];
  const kind = character?.kind || 'woman';
  const hairFill = palette[0];
  const shirtFill = palette[1];
  const skinFill = palette[2];
  const isShortHair = kind === 'man' || kind === 'boy';
  const isKid = kind === 'boy';
  return (
    <div
      className={`avatar-art avatar-art-${size}`}
      aria-label={`${character?.name || 'Character'} portrait`}
    >
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={palette[1]} stopOpacity=".18" />
            <stop offset="100%" stopColor={palette[2]} stopOpacity=".3" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="60" fill={`url(#${gradientId})`} />
        <circle
          cx="60"
          cy="62"
          r="56"
          fill="none"
          stroke="white"
          strokeOpacity=".45"
          strokeWidth="2"
        />
        <path d="M17 120c3-23 18-34 43-34s40 11 43 34H17Z" fill={shirtFill} />
        <path d="M48 80h24v18H48z" fill={skinFill} />
        {!isShortHair && (
          <path
            d="M31 50c-1-22 11-36 29-36 20 0 30 15 28 42l-1 21c-8 8-17 13-27 13S42 84 34 76l-3-26Z"
            fill={hairFill}
          />
        )}
        {isShortHair && (
          <path
            d="M31 52c0-22 11-35 29-35 19 0 30 14 28 37l-2 14-9-14c-9 1-20-3-28-10-5 8-11 12-18 14l-1-6Z"
            fill={hairFill}
          />
        )}
        <ellipse
          cx="60"
          cy={isKid ? 56 : 55}
          rx={isKid ? 24 : 23}
          ry={isKid ? 29 : 30}
          fill={skinFill}
        />
        {isShortHair && (
          <path
            d="M37 47c3-15 12-23 25-23 12 0 21 7 24 19-11 0-23-4-32-10-4 7-10 11-17 14Z"
            fill={hairFill}
          />
        )}
        {!isShortHair && (
          <path
            d="M34 40c3-18 14-27 27-27 13 0 24 10 27 28-7-8-15-13-26-13-10 0-19 4-28 12Z"
            fill={hairFill}
          />
        )}
        <path d="M48 57h4M68 57h4" stroke="#382b29" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M54 72c4 3 9 3 13 0"
          stroke="#895243"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="47" cy="64" r="3" fill={skinFill} opacity=".42" />
        <circle cx="73" cy="64" r="3" fill={skinFill} opacity=".42" />
        {kind === 'woman' && (
          <path
            d="M31 49c-5 13-5 29 2 39M88 49c5 13 5 29-2 39"
            stroke={hairFill}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        )}
        <path d="M44 93c5 4 10 6 16 6s12-2 17-6l8 27H35l9-27Z" fill={shirtFill} />
      </svg>
    </div>
  );
}
