import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#080808',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid rgba(0,255,65,0.6)',
          boxShadow: '0 0 8px rgba(0,255,65,0.4)',
        }}
      >
        {/* Shield shape via clip-path on a colored div */}
        <div
          style={{
            width: 18,
            height: 20,
            background: 'rgba(0,255,65,0.15)',
            border: '1.5px solid #00ff41',
            borderRadius: '3px 3px 40% 40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#00ff41',
              fontSize: 8,
              fontFamily: 'monospace',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            PF
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
