export default function manifest() {
  return {
    name: 'Childmap — School Arrival Tracker',
    short_name: 'Childmap',
    description: 'Real-time school gate arrival dashboard with parent notifications',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfcfc',
    theme_color: '#185fa5',
    icons: [
      {
        src: '/brand/childmap-icon-256.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  }
}
