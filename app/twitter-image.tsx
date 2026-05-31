import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CoStack social preview'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#67e8f9', fontWeight: 700, letterSpacing: '0.18em' }}>COSTACK</div>
        <div style={{ marginTop: 18, fontSize: 64, lineHeight: 1.03, fontWeight: 800, letterSpacing: '-0.05em' }}>
          Compartí licencias sin perder control.
        </div>
        <div style={{ marginTop: 20, fontSize: 26, color: '#cbd5e1', maxWidth: 880, lineHeight: 1.35 }}>
          Dashboard con pagos, cupos y acceso protegido para equipos freelance.
        </div>
      </div>
    ),
    size,
  )
}