import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#080808',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid rgba(0,255,65,0.6)',
          boxShadow: '0 0 32px rgba(0,255,65,0.3)',
        }}
      >
        {/* Shield body */}
        <div
          style={{
            width: 100,
            height: 112,
            background: 'rgba(0,255,65,0.12)',
            border: '3px solid #00ff41',
            borderRadius: '12px 12px 50% 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#00ff41',
              fontSize: 44,
              fontFamily: 'monospace',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-3px',
              textShadow: '0 0 16px rgba(0,255,65,0.8)',
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
