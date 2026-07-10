'use client'

import { useEffect } from 'react'

const DARK_CSS = `
  body { margin: 0; background: #1b1b1b !important; }

  /* ── Top bar ──────────────────────────────────────── */
  .swagger-ui .topbar { background-color: #1b1b1b; border-bottom: 1px solid #3b3b3b; }
  .swagger-ui .topbar a { font-size: 1.5em; font-weight: 700; color: #49cc90; text-decoration: none; }
  .swagger-ui .topbar-wrapper { padding: 8px 16px; }
  .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; gap: 10px; }
  .swagger-ui .topbar-wrapper img { display: none; }

  /* ── Base text & backgrounds ─────────────────────── */
  .swagger-ui,
  .swagger-ui .info,
  .swagger-ui .info p,
  .swagger-ui .info li,
  .swagger-ui .info table { color: #b5bac4; }
  .swagger-ui .info .title { color: #ffffff; }
  .swagger-ui .info .base-url { color: #6b7280; }
  .swagger-ui .scheme-container { background: #1b1b1b; box-shadow: none; padding: 20px 0; }
  .swagger-ui select { background: #2b2b2b; color: #b5bac4; border-color: #3b3b3b; }
  .swagger-ui .opblock-tag-section { background: transparent; }

  /* ── Section (tag) headers ───────────────────────── */
  .swagger-ui .opblock-tag {
    color: #ffffff;
    border-color: #3b3b3b;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 14px 20px;
    background: #232323;
    border-radius: 4px;
    margin-bottom: 4px;
  }
  .swagger-ui .opblock-tag:hover { background: #2b2b2b; }
  .swagger-ui .opblock-tag small { color: #6b7280; font-weight: 400; }
  .swagger-ui .expand-operation svg { fill: #6b7280; }

  /* ── Operation blocks ────────────────────────────── */
  .swagger-ui .opblock { border-radius: 4px; margin: 4px 0; border: 1px solid transparent; }
  .swagger-ui .opblock .opblock-summary { border-color: transparent !important; padding: 8px 20px; }
  .swagger-ui .opblock .opblock-summary-method { min-width: 80px; text-align: center; font-weight: 700; border-radius: 3px; font-size: 14px; }
  .swagger-ui .opblock .opblock-summary-path { color: #ffffff; font-family: monospace; font-size: 16px; }
  .swagger-ui .opblock .opblock-summary-description { color: #6b7280; }
  .swagger-ui .opblock-summary-control:focus { outline: none; }
  .swagger-ui .opblock svg { fill: #6b7280; }

  /* POST — green */
  .swagger-ui .opblock.opblock-post { background: rgba(73,204,144,.1); border-color: #49cc90; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90; color: #000; }
  /* GET — blue */
  .swagger-ui .opblock.opblock-get { background: rgba(97,175,254,.1); border-color: #61affe; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe; color: #000; }
  /* PATCH — orange */
  .swagger-ui .opblock.opblock-patch { background: rgba(80,227,194,.1); border-color: #50e3c2; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #50e3c2; color: #000; }
  /* DELETE — red */
  .swagger-ui .opblock.opblock-delete { background: rgba(249,62,62,.1); border-color: #f93e3e; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e; color: #fff; }
  /* PUT — orange */
  .swagger-ui .opblock.opblock-put { background: rgba(252,161,48,.1); border-color: #fca130; }
  .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130; color: #000; }

  /* ── Expanded block body ─────────────────────────── */
  .swagger-ui .opblock-body { background: #1e1e1e; }
  .swagger-ui .opblock-description-wrapper p,
  .swagger-ui .opblock-external-docs-wrapper p,
  .swagger-ui .opblock-title_normal p { color: #b5bac4; }
  .swagger-ui table tbody tr td { color: #b5bac4; border-color: #3b3b3b; }
  .swagger-ui .parameter__name { color: #e2e8f0; }
  .swagger-ui .parameter__type { color: #6b7280; }
  .swagger-ui .parameter__deprecated { color: #f93e3e; }
  .swagger-ui .parameter__in { color: #8b8b8b; font-style: italic; }
  .swagger-ui .model-hint { color: #b5bac4; background: #2b2b2b; }
  .swagger-ui .tab li { color: #b5bac4; }
  .swagger-ui .tab li.active { color: #49cc90; border-color: #49cc90; }
  .swagger-ui .opblock-section-header { background: #2b2b2b; border-color: #3b3b3b; }
  .swagger-ui .opblock-section-header h4 { color: #e2e8f0; }
  .swagger-ui textarea { background: #2b2b2b; color: #e2e8f0; border-color: #3b3b3b; }
  .swagger-ui input[type=text], .swagger-ui input[type=password], .swagger-ui input[type=email] {
    background: #2b2b2b; color: #e2e8f0; border-color: #3b3b3b;
  }

  /* ── Try it out / Execute ────────────────────────── */
  .swagger-ui .btn { border-radius: 4px; }
  .swagger-ui .btn.try-out__btn { background: transparent; border-color: #49cc90; color: #49cc90; }
  .swagger-ui .btn.try-out__btn:hover { background: #49cc90; color: #000; }
  .swagger-ui .btn.execute { background: #49cc90; border-color: #49cc90; color: #000; font-weight: 700; }
  .swagger-ui .btn.execute:hover { background: #3aad74; }
  .swagger-ui .btn.cancel { background: transparent; border-color: #f93e3e; color: #f93e3e; }
  .swagger-ui .btn.authorize { border-color: #49cc90; color: #49cc90; }
  .swagger-ui .btn.authorize svg { fill: #49cc90; }
  .swagger-ui .btn.authorize.locked { border-color: #49cc90; color: #49cc90; }
  .swagger-ui .btn.authorize.locked svg { fill: #49cc90; }

  /* ── Responses ───────────────────────────────────── */
  .swagger-ui .responses-inner { background: #1e1e1e; }
  .swagger-ui .response-col_status { color: #49cc90; }
  .swagger-ui .response-col_description { color: #b5bac4; }
  .swagger-ui .response-col_links { color: #b5bac4; }
  .swagger-ui table.responses-table td, .swagger-ui table.responses-table th { border-color: #3b3b3b; color: #b5bac4; }
  .swagger-ui .highlight-code { background: #2b2b2b; }
  .swagger-ui .microlight { background: #2b2b2b !important; color: #e2e8f0 !important; }

  /* ── Models / Schemas ────────────────────────────── */
  .swagger-ui section.models { background: #1e1e1e; border-color: #3b3b3b; }
  .swagger-ui section.models h4 { color: #e2e8f0; }
  .swagger-ui section.models .model-container { background: #2b2b2b; }
  .swagger-ui .model { color: #b5bac4; }
  .swagger-ui .model .property { color: #e2e8f0; }
  .swagger-ui .model-title { color: #e2e8f0; }
  .swagger-ui .model-toggle:after { background: #b5bac4; }
  .swagger-ui .prop-type { color: #49cc90; }
  .swagger-ui .prop-format { color: #6b7280; }

  /* ── Auth modal ──────────────────────────────────── */
  .swagger-ui .dialog-ux .modal-ux { background: #232323; border-color: #3b3b3b; }
  .swagger-ui .dialog-ux .modal-ux-header { background: #1b1b1b; border-color: #3b3b3b; }
  .swagger-ui .dialog-ux .modal-ux-header h3 { color: #ffffff; }
  .swagger-ui .dialog-ux .modal-ux-content { color: #b5bac4; }
  .swagger-ui .dialog-ux .modal-ux-content p { color: #b5bac4; }
  .swagger-ui .dialog-ux .modal-ux-content label { color: #b5bac4; }

  /* ── Markdown in descriptions ────────────────────── */
  .swagger-ui .markdown p { color: #b5bac4; }
  .swagger-ui .markdown code { background: #2b2b2b; color: #49cc90; padding: 2px 6px; border-radius: 3px; }
  .swagger-ui .markdown table { border-color: #3b3b3b; }
  .swagger-ui .markdown table th { background: #2b2b2b; color: #e2e8f0; }
  .swagger-ui .markdown table td { color: #b5bac4; border-color: #3b3b3b; }
  .swagger-ui .renderedMarkdown table tr:nth-child(even) { background: #232323; }

  /* ── Server selector ─────────────────────────────── */
  .swagger-ui .servers > label { color: #b5bac4; }
  .swagger-ui .servers select { background: #2b2b2b; color: #e2e8f0; border-color: #3b3b3b; border-radius: 4px; padding: 6px 10px; }

  /* ── Info block version badge ────────────────────── */
  .swagger-ui .info .version { background: #49cc90; color: #000; font-weight: 700; border-radius: 4px; padding: 2px 8px; }

  /* ── Scrollbar ───────────────────────────────────── */
  * { scrollbar-color: #3b3b3b #1b1b1b; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #1b1b1b; }
  ::-webkit-scrollbar-thumb { background: #3b3b3b; border-radius: 4px; }
`

export default function SwaggerDocsPage() {
  useEffect(() => {
    // Inject dark theme CSS
    const style = document.createElement('style')
    style.innerHTML = DARK_CSS
    document.head.appendChild(style)

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
    <div style={{ margin: 0, minHeight: '100vh', background: '#1b1b1b' }}>
      <div id="swagger-ui" />
    </div>
  )
}
