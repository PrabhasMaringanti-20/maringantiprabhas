import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Satori cannot parse woff2, so the card is rendered from TTF copies of the
  // same two faces. These are build-time only and never sent to the browser.
  const [clash, satoshi] = await Promise.all([
    readFile(join(process.cwd(), 'src/app/og-fonts/ClashDisplay-Bold.ttf')),
    readFile(join(process.cwd(), 'src/app/og-fonts/Satoshi-Medium.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#FBFCFE',
          backgroundImage:
            'radial-gradient(900px 500px at 88% -10%, rgba(47,91,255,0.22), transparent 60%), radial-gradient(700px 460px at 5% 108%, rgba(18,199,180,0.20), transparent 62%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Satoshi',
              fontSize: 24,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#2F5BFF',
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              fontFamily: 'Clash',
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: '#0A0D14',
              marginTop: 26,
              maxWidth: 900,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Satoshi',
              fontSize: 30,
              color: '#4A5266',
              maxWidth: 940,
              lineHeight: 1.4,
            }}
          >
            Enterprise backends in .NET and generative-AI systems that verify their own answers.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 34,
              fontFamily: 'Clash',
              fontSize: 34,
              color: '#0A0D14',
            }}
          >
            {site.name}
            <span style={{ color: '#2F5BFF' }}>.</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Clash', data: clash, style: 'normal', weight: 700 },
        { name: 'Satoshi', data: satoshi, style: 'normal', weight: 500 },
      ],
    },
  );
}
