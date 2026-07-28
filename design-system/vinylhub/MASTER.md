# VinylHub Design System — Synthwave Neon

## Identity
Premium dark music social platform inspired by the VinylHub mark: deep navy, cyan→magenta gradients, glassmorphism, orbital glow, vinyl textures.

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#080a1a` | Page background (midnight navy) |
| `--foreground` | `#f8fafc` | Primary text |
| `--muted` | `#94a3b8` | Secondary text |
| `--panel` | `#0f172a` | Elevated panels |
| `--emerald` | `#00f2ff` | Primary neon cyan (CTAs, active) |
| `--cyan` | `#5eefff` | Links, search accents |
| `--fuchsia` | `#d900ff` | Social, debates, brand end-stop |
| `--purple` | `#8a2be2` | Mid-gradient / depth |
| `--coral` | `#ff8c69` | Warm orbital accent |
| `--amber` | `#ffb086` | Soft peach highlights |

## Brand
- `--gradient-brand` — cyan → purple → magenta
- `.brand-gradient` / `.brand-gradient-text` utilities
- Mark asset: `/brand/vinylhub-mark.png`
- `.glow-mark` — dual cyan/magenta halo

## Surfaces
- `--surface-1` through `--surface-4` — cyan/magenta-tinted glass
- `.glass-border` — cyan hairline + magenta outer glow
- `.neon-grid` — cyan/magenta ambient grid overlay

## Typography
- Font: Geist Sans (body), Geist Mono (data)
- `.text-display` — page heroes
- `.text-title` — section headers
- `.text-body` — default content
- `.text-caption` — metadata

## Motion
- Fast: 150ms — hovers, toggles
- Base: 200ms — cards, nav
- Slow: 300ms — page sections
- Respect `prefers-reduced-motion`

## Components
- Primary buttons use brand gradient + neon glow
- Domain components in `src/components/vinyl/` and `src/components/music/`
- Source badges: Discogs=cyan, Spotify=cyan, VinylHub=fuchsia

## Spacing
4px base grid. Section gaps: `gap-4` (compact), `gap-6` (default), `gap-8` (hero).

## Accessibility
- WCAG AA contrast on neon accents over dark navy surfaces
- 44px minimum touch targets
- Keyboard navigation on all interactive lists
- ARIA labels on icon-only controls
