# WarishLabs — UI/UX Design System & Motion Blueprint
**Version 2.0 — Enhanced**

---

## Design Philosophy

WarishLabs should feel like a premium software company, not a personal portfolio.

The experience must immediately communicate:
- Serious engineering capability
- Modern product thinking
- Attention to detail
- Confidence in craft

The design language is **minimal, immersive, smooth, and interactive** — without ever becoming distracting. Every animation should serve the interface. Every interaction should feel intentional. The website should be enjoyable to explore even before the visitor opens a single product.

**The goal is not to impress — it is to feel inevitable.**

---

## Design Inspiration

### Primary References

| Company | What We Take From Them |
|---|---|
| Apple | Spatial depth, restraint, hardware-grade quality |
| Linear | Developer focus, minimal color, typographic clarity |
| Vercel | Dark premium, grid precision, performance-led design |
| Stripe | Motion storytelling, section rhythm, trust through design |
| Framer | 3D interactivity, motion design as product |
| Raycast | Terminal aesthetic, shortcut culture, keyboard-first |
| Cloudflare | Data visualization, scale, professional authority |
| Notion | Document energy, calm composition, readable hierarchy |

### Avoid

- Overly colorful gradients
- Heavy glassmorphism used as decoration
- Neon glow effects
- Gaming or cyberpunk visual identity
- Flashy on-load transitions
- AI-generated aesthetic (generic dark blue + circuit board backgrounds)
- Dated design trends that will not age well

The design should look excellent in 5 years.

---

## Color System

### Core Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#000000` | Main background |
| `--color-bg-secondary` | `#0A0A0A` | Elevated surfaces |
| `--color-bg-card` | `#111111` | Cards, panels |
| `--color-bg-elevated` | `#161616` | Modals, drawers, dropdowns |
| `--color-border` | `#1F1F1F` | Default borders |
| `--color-border-subtle` | `#141414` | Faint separators |
| `--color-accent` | `#2563EB` | Electric Blue — primary accent |
| `--color-accent-hover` | `#3B82F6` | Accent on hover |
| `--color-accent-glow` | `rgba(37,99,235,0.15)` | Glow halos |
| `--color-accent-subtle` | `rgba(37,99,235,0.08)` | Accent tints on cards |
| `--color-text-primary` | `#FFFFFF` | Primary text |
| `--color-text-secondary` | `#A1A1AA` | Secondary / muted text |
| `--color-text-tertiary` | `#52525B` | Placeholder, disabled |
| `--color-success` | `#10B981` | Success states |
| `--color-warning` | `#F59E0B` | Warning states |
| `--color-error` | `#EF4444` | Error states |
| `--color-info` | `#06B6D4` | Info states |

### Rules
- Blue is the only primary accent color
- No purple, no multi-color gradients
- Gradients are only used as subtle mesh backgrounds — never on text or buttons unless text gradient is the explicit signature element
- Dark surfaces increase in lightness with elevation: `bg-primary` → `bg-secondary` → `bg-card` → `bg-elevated`

---

## Typography

### Font Stack

| Role | Font | Usage |
|---|---|---|
| Display / Heading | Geist | Large headlines, hero titles, section headings |
| Body | Geist | Body text, descriptions, UI copy |
| Monospace | Geist Mono | Code snippets, technical labels, version numbers, terminal-style UI |

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-display` | 72–96px | 700 | 1.0 | Hero headline only |
| `text-h1` | 48–60px | 700 | 1.1 | Page titles |
| `text-h2` | 36–42px | 600 | 1.15 | Section headings |
| `text-h3` | 24–30px | 600 | 1.2 | Sub-section headings |
| `text-h4` | 20px | 600 | 1.25 | Card titles |
| `text-body-lg` | 18px | 400 | 1.6 | Lead paragraphs |
| `text-body` | 16px | 400 | 1.7 | Body text |
| `text-body-sm` | 14px | 400 | 1.6 | Secondary text |
| `text-caption` | 12px | 400 | 1.5 | Labels, metadata |
| `text-mono` | 13px | 400 | 1.5 | Code, version tags |

### Typography Rules
- Headings: never cramped, always with substantial space above
- Body: `--color-text-secondary` at 16px feels more premium than white
- Never use font sizes below 12px
- Letter spacing: `-0.02em` on large headings, `0.05em` on uppercase labels
- Line length: max `65ch` for body text paragraphs

---

## Spacing System

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

Sections have at minimum `--space-24` (96px) vertical padding on desktop. Breathing room is what separates premium from cheap.

---

## Border Radius

```css
--radius-sm:   4px    /* Tags, badges */
--radius-md:   8px    /* Inputs, small cards */
--radius-lg:   12px   /* Cards, panels */
--radius-xl:   16px   /* Modals, large cards */
--radius-2xl:  24px   /* Hero elements */
--radius-full: 9999px /* Pills, avatars */
```

---

## Shadows and Glow

```css
/* Subtle card shadow */
--shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6);

/* Elevated panel */
--shadow-elevated: 0 4px 24px rgba(0,0,0,0.6);

/* Modal */
--shadow-modal: 0 20px 60px rgba(0,0,0,0.8);

/* Blue glow — for accent elements and 3D cube */
--glow-accent: 0 0 20px rgba(37,99,235,0.3), 0 0 60px rgba(37,99,235,0.1);

/* Blue glow on hover */
--glow-accent-hover: 0 0 30px rgba(37,99,235,0.5), 0 0 80px rgba(37,99,235,0.15);

/* Card hover glow */
--glow-card: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.2);
```

---

## Motion Philosophy

Animations support the interface. They are never decorative.

**Principles:**
1. The user should feel smooth, not watch animations
2. Motion guides attention — entrance reveals where to look
3. Hover interactions make the UI feel physically real
4. 3D elements establish depth and premium quality
5. Every animation has an easing curve that feels physical (spring)
6. Animations respect `prefers-reduced-motion`

**Framer Motion is the animation engine for all UI.**
**React Three Fiber / Three.js is the engine for 3D.**

---

## Animation Tokens

```typescript
// constants/motion.ts

export const SPRING_DEFAULT = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

export const SPRING_BOUNCY = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
}

export const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94]
export const EASE_ENTRANCE = [0.0, 0.0, 0.2, 1.0]
export const EASE_EXIT = [0.4, 0.0, 1.0, 1.0]

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
}

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export const DURATION = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
}
```

---

## Global Animation Rules

| Element | Animation |
|---|---|
| Page transition | `FADE_UP` with 0.15s duration |
| Section reveal | `FADE_UP` on scroll enter via `IntersectionObserver` |
| Card entrance | `STAGGER_ITEM` inside `STAGGER_CONTAINER` |
| Card hover | Y: -4px, box-shadow upgrade, border glow, 0.2s spring |
| Button hover | Scale 1.02, glow intensify, background transition |
| Button press | Scale 0.97, instant |
| Icon hover | Subtle rotate ±8deg or translate, 0.2s |
| Dropdown | `FADE_UP` + blur, 0.15s |
| Modal open | `SCALE_IN` + backdrop fade, 0.25s |
| Drawer open | Slide in from right/bottom, spring |
| Tooltip | `FADE_IN`, 0.1s delay |
| Number counter | Count up animation on scroll enter |
| Image | Fade in with scale from 1.02 → 1.0 |
| Navbar scroll | Blur + dark glass transition, 0.3s |
| Form input focus | Blue border glow, label float up |
| Loading skeleton | Shimmer pulse animation |

---

## Hero Section

The hero is the visual identity of WarishLabs.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────────────────┐  ┌───────────────────────┐  │
│   │                      │  │                       │  │
│   │  Small badge tag     │  │                       │  │
│   │                      │  │    3D CUBE           │  │
│   │  Large Headline      │  │                       │  │
│   │  (2-3 lines)         │  │    Interactive        │  │
│   │                      │  │    Floating           │  │
│   │  Description text    │  │    Blue glow edges    │  │
│   │  (2 lines max)       │  │                       │  │
│   │                      │  └───────────────────────┘  │
│   │  [CTA Primary]  [→]  │                             │
│   │                      │  Floating tech badges       │
│   │  — 12 Products       │  Connection lines           │
│   │  — 3 Internships     │  Particle dots              │
│   │  — 5K+ Lines Built   │                             │
│   │                      │                             │
│   └──────────────────────┘                             │
│                                                         │
│  ░░░░░░░░░░░░░ Background particles ░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────┘
```

### Hero Copy Guidelines
- Headline: Direct, bold, product company framing (not "I am a developer")
- Description: What WarishLabs builds and for whom (2 lines max)
- CTA Primary: "Explore Products" or "See What We Build"
- CTA Secondary: "View GitHub →"

---

## 3D Hero Cube

The cube is the visual signature of WarishLabs.

### Technology
- **React Three Fiber** (Three.js declarative)
- **@react-three/drei** helpers
- Rendered in a `<Canvas>` component, lazy loaded

### Cube Specification

```tsx
// Cube appearance
material: MeshPhysicalMaterial {
  color: #0A0A0A,           // Near-black base
  metalness: 0.9,
  roughness: 0.05,
  transmission: 0.3,        // Slight glass transparency
  thickness: 0.5,
  envMapIntensity: 1.0,
  emissive: #1D4ED8,        // Blue inner glow
  emissiveIntensity: 0.15,
}

// Edge glow via EdgesGeometry + LineBasicMaterial
edgeColor: #2563EB           // Electric Blue
edgeOpacity: 0.8

// Scale
size: [2.2, 2.2, 2.2]       // units

// Lighting
- AmbientLight: intensity 0.2
- PointLight: #2563EB, position [3, 3, 3], intensity 1.5, distance 10
- PointLight: #FFFFFF, position [-3, -3, 2], intensity 0.3
- RectAreaLight: #1D4ED8, above and behind cube, low intensity
```

### Cube Animation

```tsx
// Idle animation — runs always
useFrame((state) => {
  const time = state.clock.getElapsedTime()
  meshRef.current.rotation.y = time * 0.12           // Slow Y rotation
  meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.08  // Gentle breathing X
  meshRef.current.position.y = Math.sin(time * 0.5) * 0.12  // Float up/down
})
```

### Mouse Interaction

```tsx
// On mouse move over hero section
const handleMouseMove = (event) => {
  const { clientX, clientY } = event
  const { innerWidth, innerHeight } = window

  // Normalize to -1 to +1
  mouseX = (clientX / innerWidth) * 2 - 1
  mouseY = -(clientY / innerHeight) * 2 + 1

  // Apply to cube rotation with lerp (smooth follow)
  targetRotationY = mouseX * 0.12    // Max ~7 degrees
  targetRotationX = mouseY * 0.08    // Max ~5 degrees

  // Animate toward target
  meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05
  meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05
}
```

**Maximum tilt: ±8 degrees. Never spins. Always feels physical.**

### Icons Inside/On Cube Faces

Small floating icons representing technologies — Next.js, TypeScript, PostgreSQL, React — appear as subtle textures or `<Html>` portals on each cube face. They shift with cube rotation for depth effect.

### Cube Performance
- Rendered in `<Suspense>` with fallback
- Disabled on mobile (replaced with static image)
- `pixelRatio` capped at `Math.min(window.devicePixelRatio, 2)`
- `frameloop: demand` or `always` based on visibility

---

## Background Animation

The hero background is never static.

### Layers (bottom to top, all low opacity)

```
Layer 1: Animated gradient mesh
  - Slow-moving radial gradients in #000814 and #0A1628
  - 20s loop, CSS keyframes

Layer 2: Blueprint grid
  - SVG grid pattern, 40px cells
  - 5% opacity
  - Very subtle blue tint (#2563EB at 3%)

Layer 3: Floating particle field
  - 60–80 particles
  - Random sizes 1–3px
  - Blue-white color mix
  - Random drift animation per particle
  - 8–15s loop each
  - 15–40% opacity

Layer 4: Glow orbs
  - 2–3 large blurred circles
  - #1D4ED8 at 6% opacity
  - Slowly drift and scale
  - CSS animation

Layer 5: Scan line (optional)
  - Single horizontal line sweeping downward
  - 2px, #2563EB at 15%
  - 8s loop
  - Very subtle
```

All implemented with CSS + canvas or Three.js background pass. Never impact frame rate.

---

## Floating Tech Cards (Hero Decorative)

Small cards float around the 3D cube area.

```tsx
// Each card
interface FloatingCard {
  icon: string         // Technology logo
  label: string        // Technology name
  x: number           // Position relative to cube
  y: number
  delay: number        // Stagger delay
}

// Animation
animate={{
  y: [0, -8, 0],
  rotate: [-1, 1, -1],
  transition: {
    duration: 4 + index * 0.5,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: index * 0.3,
  }
}}
```

Cards show: Next.js, React, TypeScript, PostgreSQL, Prisma, Node.js.

---

## Navbar

### Default State (Top of Page)

```
Background: transparent
Border: none
Logo: full opacity
Links: white at 80% opacity
```

### Scrolled State

```css
background: rgba(0, 0, 0, 0.85);
backdrop-filter: blur(20px) saturate(180%);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
transition: all 0.3s ease;
```

### Behavior
- Logo scales slightly on hover (scale 1.05)
- Active page link shows blue underline accent
- Hover link: white at 100%
- Mobile: hamburger menu slides in from right with backdrop blur
- Search icon opens global search panel (Command-K style)

---

## Product Cards

```
┌────────────────────────────┐
│  ░░ Product Banner Image   │  ← Slow zoom on hover
│                            │
├────────────────────────────┤
│  [Status Badge]            │
│                            │
│  Product Name              │  ← Bold, white
│  Tagline text              │  ← Secondary gray
│                            │
│  [Tech] [Tech] [Tech]      │  ← Small badges
│                            │
│  [Visit →]  [Details]      │  ← Button reveal on hover
└────────────────────────────┘
```

### Hover State

```css
transform: translateY(-4px);
border: 1px solid rgba(37, 99, 235, 0.3);
box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.2);
transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

Image: `scale(1.04)` with `overflow: hidden`
Buttons: fade in from opacity 0 to 1

---

## Button System

### Variants

```tsx
// Primary
className="bg-[#2563EB] text-white hover:bg-[#3B82F6] 
           hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]
           active:scale-[0.97] transition-all duration-150"

// Secondary (ghost)
className="border border-[#1F1F1F] text-white hover:border-[#2563EB] 
           hover:bg-[rgba(37,99,235,0.08)]
           active:scale-[0.97] transition-all duration-150"

// Ghost text
className="text-[#A1A1AA] hover:text-white transition-colors duration-150"
```

### Micro-states

| State | Visual |
|---|---|
| Default | Base style |
| Hover | Scale 1.01, glow or border shift |
| Focus | Blue ring (accessible) |
| Active / Press | Scale 0.97, instant |
| Loading | Spinner replaces text, disabled |
| Success | Green checkmark fade in |
| Disabled | Opacity 0.4, no hover |

---

## Statistics Section

```tsx
// Each stat card
<motion.div variants={STAGGER_ITEM}>
  <AnimatedCounter from={0} to={value} duration={1.5} />
  <p>{label}</p>
</motion.div>

// AnimatedCounter uses useSpring from Framer Motion
// Triggers when section enters viewport
// Format: 1000 → "1K+", 50000 → "50K+"
```

Stats stagger in one by one, counters count up with spring easing.

---

## Blog Cards

```
┌────────────────────────────────┐
│  Cover Image                   │  ← scale(1.03) on hover
├────────────────────────────────┤
│  [Category Badge]              │  ← colored by category
│  Article Title                 │  ← h3, white
│  Excerpt preview               │  ← 2 lines, clamp
│                                │
│  5 min read · Jun 2025         │
└────────────────────────────────┘
```

Category badges have soft color coding:
- Development: Blue
- AI: Cyan
- Engineering: Purple-gray
- Case Study: Amber
- Announcement: Green

---

## Forms

### Input States

```css
/* Default */
border: 1px solid #1F1F1F;
background: #0A0A0A;

/* Focus */
border: 1px solid #2563EB;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
transition: all 0.15s ease;

/* Error */
border: 1px solid #EF4444;
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);

/* Success */
border: 1px solid #10B981;
```

### Label Animation (Floating Label Pattern)

```tsx
// Label floats up when input is focused or has value
// Font size: 14px → 11px
// Color: gray → blue
// Transform: translateY(0) → translateY(-20px)
// Spring transition
```

### Form Submission Flow

```
User clicks Submit
  ↓
Button shows spinner + "Sending..."
  ↓
Success: button → green checkmark + "Sent!" (1.5s)
  ↓
Form fades out, success message fades in
  ↓
OR Error: red shake animation on form
```

---

## Loading Experience

```
1. Page Load
   ├── Top progress bar (NProgress style, #2563EB)
   └── Fade in from black (0.3s)

2. Content Loading
   └── Skeleton screens (animated shimmer, not spinner)
       ├── Product card skeleton
       ├── Blog card skeleton
       └── Table row skeleton

3. Image Loading
   └── Blurred low-res placeholder → full image fade in

4. Never: blank white flash, hard cut transitions
```

---

## Admin Dashboard Design

The admin should feel like a premium SaaS dashboard — Vercel meets Linear.

### Sidebar

```
┌──────────────────┐
│  WarishLabs Logo │
│  ──────────────  │
│  Dashboard       │
│  ──────────────  │
│  Content         │
│  › Products      │
│  › Categories    │
│  › Blog          │
│  › Labs          │
│  › Open Source   │
│  ──────────────  │
│  Site            │
│  › Homepage      │
│  › Navigation    │
│  › SEO           │
│  › Media         │
│  ──────────────  │
│  Growth          │
│  › Analytics     │
│  › Visitors      │
│  › Newsletter    │
│  › Messages      │
│  ──────────────  │
│  System          │
│  › Settings      │
│  › Activity Logs │
│  › System        │
└──────────────────┘
```

### Dashboard Widgets

Each widget animates in with `STAGGER_ITEM`:
- Overview stat cards (visitors, products, messages, subscribers)
- Real-time visitor count (live pulse dot + number)
- Recent activity feed
- Top products chart (Recharts BarChart)
- Visitor trend chart (Recharts AreaChart)
- Quick action buttons

### Chart Animations

```tsx
// Recharts AreaChart — lines draw themselves on mount
animationBegin={0}
animationDuration={1200}
animationEasing="ease-out"

// Numbers count up on mount
// Bar charts grow from 0
// Pie charts rotate in from 12 o'clock
// Tooltip fades in instantly
```

---

## Micro Interactions

Every interactive element has visual feedback.

| Action | Feedback |
|---|---|
| Copy to clipboard | Icon swaps to checkmark for 1.5s |
| Delete action | Item slides out + fades, height collapses |
| Toggle switch | Smooth slide, color transition 0.2s |
| Expand accordion | Height animation, chevron rotates 180° |
| Collapse | Reverse |
| Drag to reorder | Item lifts (shadow intensifies), ghost position shows |
| Search type | Results fade in below, stagger 0.04s per item |
| Status change | Badge color transitions smoothly |
| Upload complete | Progress bar → green checkmark |
| Notification | Slides in from top-right, auto-dismiss with progress bar |

---

## Mouse Cursor Effects (Optional Enhancement)

```tsx
// Soft cursor glow — follows mouse with spring lag
// Implementation: position: fixed div with pointer-events: none
// Size: 300px circle, radial gradient
// Color: rgba(37, 99, 235, 0.04) at center → transparent
// Spring follow: stiffness 100, damping 20

// On button hover: cursor companion scales to 60px
// On card hover: cursor companion scales to 80px, opacity increases
// Never replaces system cursor
// Disabled on mobile and touch devices
// Opt-in via site settings
```

---

## Scroll Animation Implementation

```tsx
// useScrollReveal hook
// Uses IntersectionObserver, threshold 0.15
// Once: true — animates once, never replays

const useScrollReveal = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, isInView }
}

// Usage in every section
<motion.section
  ref={ref}
  variants={FADE_UP}
  initial="initial"
  animate={isInView ? "animate" : "initial"}
  transition={SPRING_GENTLE}
>
```

---

## Responsive Design System

### Breakpoints

```css
sm:   640px    /* Large phones */
md:   768px    /* Tablets */
lg:   1024px   /* Small laptops */
xl:   1280px   /* Laptops */
2xl:  1536px   /* Large desktop */
```

### Responsive Rules

| Feature | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero layout | 2-column | 2-column | 1-column (cube below) |
| 3D cube | Full interactive | Simplified | Static image fallback |
| Particle effects | Full | Reduced (50%) | Disabled |
| Mouse glow | Enabled | Disabled | Disabled |
| Card grid | 3 columns | 2 columns | 1 column |
| Animations | Full | Full | Reduced |
| Floating cards | Visible | Hidden | Hidden |
| Sidebar (admin) | Always visible | Collapsible | Drawer |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* All Framer Motion animations: duration → 0.01s */
  /* 3D cube: rotation paused */
  /* Particle effects: disabled */
  /* Counter animations: jump to final value */
  /* Page transitions: instant */
}
```

```tsx
// In components
const shouldReduceMotion = useReducedMotion()
const animation = shouldReduceMotion ? {} : FADE_UP
```

---

## Accessibility Standards

| Standard | Implementation |
|---|---|
| Color contrast | Minimum 4.5:1 for body, 3:1 for UI |
| Focus visible | Blue ring on all interactive elements |
| Keyboard navigation | Full tab order, escape to close modals |
| Screen readers | Proper aria-labels, roles, live regions |
| Images | All images have meaningful alt text |
| Motion | `prefers-reduced-motion` respected |
| Forms | Labels associated, error messages announced |
| Skip link | "Skip to content" at top of page |
| Semantic HTML | Proper heading hierarchy, landmark regions |

---

## Component-Level Design Specs

### Technology Badge

```tsx
// Small pill showing technology name
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 
                  rounded-full text-xs font-medium
                  bg-[#111] border border-[#1F1F1F]
                  text-[#A1A1AA] hover:border-[#2563EB] 
                  hover:text-white transition-all duration-150">
  <img src={tech.logoUrl} className="w-3.5 h-3.5" />
  {tech.name}
</span>
```

### Status Badge

```tsx
const STATUS_STYLES = {
  LIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  BETA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  BUILDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEPRECATED: 'bg-red-500/10 text-red-400 border-red-500/20',
  ARCHIVED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

// LIVE badge also has a pulsing green dot
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full 
                    rounded-full bg-emerald-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
</span>
```

### Search Panel (Command-K)

```
┌─────────────────────────────────────────┐
│  🔍  Search products, blogs, docs...    │
├─────────────────────────────────────────┤
│  Recent                                 │
│  › Festoryx                             │
│  › Blueprint API                        │
├─────────────────────────────────────────┤
│  Results                                │
│  [icon] Product Name      [tag]         │
│  [icon] Blog Post Title   [Blog]        │
│  [icon] Category Name     [Category]    │
└─────────────────────────────────────────┘
```

Full keyboard navigation. Results update on every keystroke (debounced 150ms). Modal overlay with blur backdrop. Escape to close.

---

## Final UX Goal

When someone visits WarishLabs, they should immediately think:

> *"This doesn't feel like a student portfolio."*
> *"It feels like a real software company."*
> *"The products look trustworthy."*
> *"The interface is incredibly polished."*
> *"I want to explore what they've built."*

That impression — built through restraint, detail, and purposeful motion — is the entire purpose of this design system.

Every color is chosen. Every space is earned. Every animation serves the interface. Every interaction reinforces trust.

**This is not decoration. This is engineering.**
