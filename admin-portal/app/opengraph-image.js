import { ImageResponse } from 'next/og'

export const alt = 'Childmap — School Arrival Tracker'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: '#185fa5',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
          Childmap
        </div>
        <div style={{ display: 'flex', fontSize: 36, opacity: 0.85 }}>
          Real-time school gate arrival tracking
        </div>
      </div>
    ),
    { ...size }
  )
}
