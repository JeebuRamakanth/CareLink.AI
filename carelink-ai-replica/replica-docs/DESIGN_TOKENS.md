# Design Tokens (verified from source CSS)

| Token/element | Value | Evidence |
|---|---|---|
| Root font | DM Sans | `src/styles.css` import + root |
| Display/headings | Manrope | source component/style rules |
| Root text | `#172b35` | `:root` |
| Root background | `#fbfdfd` | `:root` |
| Brand teal | `#0b766e` | `--teal` |
| Deep teal | `#123d42` | `--deep` |
| Mint | `#e6f5f1` | `--mint` |
| Muted text | `#6c7f86` | `--muted` |
| Border line | `#e4edeb` | `--line` |
| Shared shadow | `0 16px 48px rgba(22,66,67,.08)` | `--shadow` |
| Header height | `82px` | `.topbar` |
| Header surface | `rgba(255,255,255,.94)` | `.topbar` |
| Hero background | radial + linear gradients | `.hero` |
| Focus indicator | `3px solid #79cbb8`, 3px offset | focus-visible rules |

No production computed styles or pixel coordinates were captured. Values above are source-verified, not inferred from a screenshot. Additional per-component values remain in the copied original CSS.
