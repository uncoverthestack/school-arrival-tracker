'use client'

import { useEffect } from 'react'

export default function SwaggerDocsPage() {
  useEffect(() => {
    // Load swagger-ui base CSS
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css'
    document.head.appendChild(css)

    // Load bundle then preset then init
    const bundle = document.createElement('script')
    bundle.src = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js'
    bundle.onload = () => {
      const preset = document.createElement('script')
      preset.src = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js'
      preset.onload = () => {
        window.SwaggerUIBundle({
          url: '/api/docs',
          dom_id: '#swagger-ui',
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIStandalonePreset
          ],
          plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
          layout: 'StandaloneLayout',
          deepLinking: true,
          tryItOutEnabled: true,
          tagsSorter: 'alpha',
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
          syntaxHighlight: { activated: true, theme: 'monokai' },
          // Replace the default Swagger logo link text
          customSiteTitle: 'SchoolPass API Docs'
        })
      }
      document.head.appendChild(preset)
    }
    document.head.appendChild(bundle)
  }, [])

  return (
    <div style={{ margin: 0, minHeight: '100vh', background: '#ffffff' }}>
      <div id="swagger-ui" />
    </div>
  )
}
