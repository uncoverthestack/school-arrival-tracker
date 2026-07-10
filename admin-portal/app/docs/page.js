'use client'

import { useEffect } from 'react'

export default function DocsPage() {
  useEffect(() => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css'
    document.head.appendChild(css)

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
          layout: 'StandaloneLayout',
          deepLinking: true,
          tryItOutEnabled: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
        })
      }
      document.head.appendChild(preset)
    }
    document.head.appendChild(bundle)
  }, [])

  return (
    <div style={{ margin: 0, minHeight: '100vh' }}>
      <div id="swagger-ui" />
    </div>
  )
}
