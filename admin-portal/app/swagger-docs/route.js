import { redirect } from 'next/navigation'
import { getRootDomain } from '@/lib/domain'
import { hasDocsAccess } from '@/lib/docsAccess'
import { resolveBrand } from '@/lib/brands'

// Human-readable API reference. The OpenAPI document itself is generated at
// /api/docs; this route only renders it. Served as a route handler rather than a
// page so Swagger UI's own bundle stays out of the app's client JS — it is a large
// dependency that nothing else needs.
//
// Pinned to an exact Swagger UI version: floating to @latest would let an upstream
// release change the rendering of a public-facing page without a deploy here.
const SWAGGER_VERSION = '5.17.14'
const BASE = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}`

export async function GET() {
  // Carry the destination through the login so the reader lands back here rather
  // than on the dashboard, which makes the gate look like a dead link.
  if (!await hasDocsAccess()) redirect('/login?next=/swagger-docs')

  const rootDomain = await getRootDomain()
  const brand = resolveBrand(rootDomain)
  const title = `${brand.name} API`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Documentation</title>
  <link rel="icon" href="/brand/childmap-icon-256.png" />
  <link rel="stylesheet" href="${BASE}/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
    .swagger-ui .info { margin: 24px 0; }
    #sw-header {
      padding: 16px 24px; background: #111827; color: #fff;
      display: flex; align-items: center; gap: 12px; font-family: system-ui, sans-serif;
    }
    #sw-header img { width: 26px; height: 26px; }
    #sw-header strong { font-size: 15px; letter-spacing: .3px; }
    #sw-header span { margin-left: auto; font-size: 12px; opacity: .7; }
  </style>
</head>
<body>
  <div id="sw-header">
    <img src="/brand/childmap-icon-256.png" alt="" />
    <strong>${title}</strong>
    <span>OpenAPI 3.0 · <a href="/api/docs" style="color:#93c5fd">raw spec</a></span>
  </div>
  <div id="swagger-ui"></div>
  <script src="${BASE}/swagger-ui-bundle.js" crossorigin></script>
  <script src="${BASE}/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        // Endpoints are school-scoped by an x-api-key header; persist it so a reader
        // can authorise once and try several calls.
        persistAuthorization: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 0,
        tryItOutEnabled: true,
      })
    }
  </script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // The spec changes only on deploy, so let the CDN hold the shell briefly.
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
