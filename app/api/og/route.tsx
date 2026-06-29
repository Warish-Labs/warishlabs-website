import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'WarishLabs';
    const subtitle = searchParams.get('subtitle') || 'Engineering-First Software Laboratory';
    const category = searchParams.get('category') || 'SAAS PLATFORMS';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#000000',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #020b1a 0%, #000000 100%)',
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              width: '100%',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '6px',
                  marginRight: '12px',
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                }}
              >
                WarishLabs
              </span>
              <span style={{ margin: '0 16px', color: '#333333', fontSize: '24px' }}>|</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#3B82F6',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </span>
            </div>

            {/* Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' }}>
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '22px',
                  color: '#A1A1AA',
                  lineHeight: 1.4,
                  margin: '20px 0 0 0',
                  maxWidth: '850px',
                }}
              >
                {subtitle}
              </p>
            </div>

            {/* Footer metrics */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                borderTop: '1px solid #1F1F1F',
                paddingTop: '24px',
                fontSize: '14px',
                color: '#52525B',
                fontFamily: 'monospace',
              }}
            >
              <span>SYS_STATUS: ACTIVE</span>
              <span>WWW.WARISHLABS.IN</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('[API OG] Failed to generate image:', e);
    return new Response('Failed to generate dynamic OG banner', { status: 500 });
  }
}
