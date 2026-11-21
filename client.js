// dsh-lifi-adapters — glass surface bridge and third-party page adapters.
//
// Liue (dsh-lifiwallpaper) 0.2.7 deliberately does NOT ship the public glass
// API anymore. This adapter is the single owner of that contract:
//
//   * it defines the `.lifi-glass` class and the --lifi-* variables,
//   * it adapts dsh-memory-evolve / billion-context pages,
//   * it exposes `window.dshLifiGlass` for feature detection,
//   * and it stays completely inert unless the exact compatible Liue version
//     is present (adapter 0.1.0 -> Liue 0.2.7).
window.__ModuleLoader__.load({
  id: 'dsh-lifi-adapters',
  factory: () => {
    const ADAPTER_VERSION = '0.1.0'
    const REQUIRED_LIFI = '0.2.7'
    const STYLE_ID = 'dsh-lifi-adapters/glass'

    const CSS = `
      /* -- public Liue surface contract, defined here, not in Liue --------- */
      html[data-lifi-adapters='1'] {
        --lifi-radius: var(--dsh-ap-radius, 14px);
        --lifi-blur: var(--dsh-ap-blur, 0px);
        --lifi-surface-bg: rgba(255, 255, 255, var(--dsh-ap-alpha, 0.55));
        --lifi-surface-border: rgba(255, 255, 255, 0.30);
      }
      html[data-lifi-adapters='1'][data-dsh-ap-scheme='dark'] {
        --lifi-surface-bg: rgba(18, 20, 26, var(--dsh-ap-alpha, 0.55));
        --lifi-surface-border: rgba(255, 255, 255, 0.12);
      }
      html[data-lifi-adapters='1'] .lifi-glass {
        background-color: var(--lifi-surface-bg) !important;
        -webkit-backdrop-filter: blur(var(--lifi-blur)) saturate(1.18) !important;
        backdrop-filter: blur(var(--lifi-blur)) saturate(1.18) !important;
        border: 1px solid var(--lifi-surface-border) !important;
        border-radius: var(--lifi-radius) !important;
      }

      /* -- page roots: let the wallpaper through ------------------------- */
      html[data-lifi-adapters='1'] .mt-panel,
      html[data-lifi-adapters='1'] .me-panel,
      html[data-lifi-adapters='1'] .coi-root,
      html[data-lifi-adapters='1'] .sb-root,
      html[data-lifi-adapters='1'] .pm-root,
      html[data-lifi-adapters='1'] .bm-panel,
      html[data-lifi-adapters='1'] .bb-pane {
        background-color: transparent !important;
        background-image: none !important;
      }

      /* -- top-level cards: Liue glass ----------------------------------- */
      html[data-lifi-adapters='1'] .me-block,
      html[data-lifi-adapters='1'] .me-todo-quad,
      html[data-lifi-adapters='1'] .me-guide-row,
      html[data-lifi-adapters='1'] .me-archive-content,
      html[data-lifi-adapters='1'] .mt-card,
      html[data-lifi-adapters='1'] .mt-scope,
      html[data-lifi-adapters='1'] .mt-key-add,
      html[data-lifi-adapters='1'] .bb-card,
      html[data-lifi-adapters='1'] .bb-session-line,
      html[data-lifi-adapters='1'] .bb-members,
      html[data-lifi-adapters='1'] .bb-room-msgs {
        background-color: var(--lifi-surface-bg) !important;
        -webkit-backdrop-filter: blur(var(--lifi-blur)) saturate(1.18) !important;
        backdrop-filter: blur(var(--lifi-blur)) saturate(1.18) !important;
        border-color: var(--lifi-surface-border) !important;
        border-radius: var(--lifi-radius) !important;
      }

      /* -- nested rows: transparent, the parent card carries the glass --- */
      html[data-lifi-adapters='1'] .me-item,
      html[data-lifi-adapters='1'] .me-todo-card,
      html[data-lifi-adapters='1'] .mt-entry,
      html[data-lifi-adapters='1'] .bb-member,
      html[data-lifi-adapters='1'] .bm-item {
        background-color: transparent !important;
      }

      /* -- billion-context 上下文 is a cross-origin iframe: frame only ---- */
      html[data-lifi-adapters='1'] iframe[src*='__bili'] {
        border-radius: var(--lifi-radius, 14px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
      }
    `

    let dispose = null
    let observer = null

    function liueVersion() {
      return document.documentElement.getAttribute('data-dsh-ap-version')
    }

    function install() {
      if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)) return () => {}
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-lifi-adapters'
      tag.dataset.pluginCss = STYLE_ID
      tag.textContent = CSS
      document.head.appendChild(tag)
      document.documentElement.setAttribute('data-lifi-adapters', '1')
      window.dshLifiGlass = Object.freeze({
        version: ADAPTER_VERSION,
        protocol: `lifi-appearance/${REQUIRED_LIFI}`,
        surfaceClass: 'lifi-glass',
        variables: ['--lifi-surface-bg', '--lifi-surface-border', '--lifi-blur', '--lifi-radius'],
      })
      return () => {
        if (tag.parentNode) tag.parentNode.removeChild(tag)
        document.documentElement.removeAttribute('data-lifi-adapters')
        delete window.dshLifiGlass
      }
    }

    function sync() {
      const compatible = liueVersion() === REQUIRED_LIFI
      if (compatible && !dispose) {
        dispose = install()
      } else if (!compatible && dispose) {
        dispose()
        dispose = null
      }
    }

    function apply(ctx) {
      ctx.effect(() => {
        sync()
        observer = new MutationObserver(sync)
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-dsh-ap-version'],
        })
        return () => {
          if (observer) observer.disconnect()
          observer = null
          if (dispose) {
            dispose()
            dispose = null
          }
        }
      }, 'dsh-lifi-adapters: glass styles')
    }

    return { apply, inject: [] }
  },
})
