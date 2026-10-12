# Design System & Styling Guide

DeadTime embodies a modern cyberpunk and terminal-inspired visual aesthetic, emphasizing high-contrast dark surfaces and neon green accents.

---

## Color Palette

| Token | Hex Value | Role / Usage |
|---|---|---|
| **Primary Accent** | `#00ff90` | Neon Green: CTA buttons, active indicators, highlights, badges |
| **Background** | `#000000` | Pure Black: Root application background, hero sections |
| **Surface** | `#18181b` | Zinc-900: Cards, modals, containers, navigation bars |
| **Border** | `#27272a` | Zinc-800: Structural borders, divider lines, grid demarcations |
| **Text Primary** | `#ffffff` | Headings, emphasized labels, high-contrast text |
| **Text Muted** | `#a1a1aa` | Zinc-400: Body copy, timestamps, secondary metadata |

---

## Typography

| Type Role | Font Family | Fallback | Intended Usage |
|---|---|---|---|
| **Display / Headings** | Playfair Display | `Georgia, serif` | Hero headlines, major titles, brand voice |
| **Body & UI** | Inter | `system-ui, sans-serif` | Component labels, descriptions, chats, inputs |
| **Code & Monospace** | JetBrains Mono | `monospace` | Contract addresses, transaction hashes, code snippets |

---

## Layout & Geometric Principles

1. **Zero Border Radius (`rounded-none`)**:
   - Clean, angular, terminal-inspired interface edges for components, buttons, and cards.
2. **High-Contrast Surface Borders**:
   - `border border-zinc-800` demarcates panels against pure black canvases without visual clutter.
3. **Responsive Navigation**:
   - Desktop collapsible sidebar (256px wide expanded down to 80px in icon-collapsed mode).
   - Mobile slide-out drawer with backdrop blur.
4. **Motion & Feedback**:
   - Subtle hover glows using neon green drop shadows (`drop-shadow-[0_0_8px_rgba(0,255,144,0.3)]`).
   - Smooth CSS transitions (`transition-colors duration-150 ease-in-out`).
