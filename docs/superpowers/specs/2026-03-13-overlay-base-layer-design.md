# Overlay Base Layer System

## Problem

When customers select overlay garments (blazers), the underlying clothing in their photo clashes with the overlay, producing unnatural results. The Fashn API treats blazers as regular tops, replacing the entire upper body area instead of layering over a base garment.

## Solution

Automatically add a base layer (best-selling t-shirt) when a blazer is selected, running the pipeline in 2 steps: base first, then overlay on top.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Overlay detection | Keyword `blazer` only | Only blazers in the Paradise catalog need this treatment |
| Category UI | Badge on card, no separate tab | Overlays stay in "Parte de Cima", visual badge "Sobreposição" |
| Base selection | Auto-select best-selling t-shirt | Minimum friction, C option |
| Change base | Toast/snackbar, 5s, tap to change | Minimal intrusion |
| Remove overlay | Base stays as normal top | Natural behavior |

## Technical Design

### 1. Type Changes (`types/index.ts`)

- Add `"overlays"` to `GarmentCategory` union
- Add `isOverlay?: boolean` flag to `Product` interface

### 2. Detection (`lib/nuvemshop.ts`)

- New regex: `BLAZER_RE = /blazer/i`
- In `detectCategory`: if product name matches `BLAZER_RE`, return `"overlays"`
- In `matchKeywords`: check blazer before general tops
- Overlays included when filtering by `"tops"` category in `getProducts`

### 3. Store (`store/use-tryon-store.ts`)

- New state: `baseLayer: Product | null`
- New action: `setBaseLayer(product)`, `clearBaseLayer()`
- Modified `selectItem`: when selecting an overlay:
  - If no existing top selected → auto-fetch and set base layer
  - If existing top selected → move it to base layer
- Modified `removeItem`: when removing overlay → base stays as top, `baseLayer` cleared

### 4. UI Components

#### `product-card.tsx`
- Show teal badge "Sobreposição" on overlay products (top-right, below selection check)

#### `base-layer-toast.tsx` (new)
- Toast with message: "Camiseta adicionada como base do blazer. Toque para trocar"
- 5s auto-dismiss with progress bar
- Tap opens base picker drawer
- Zustand-triggered: shows when `baseLayer` is set automatically

#### `base-picker-drawer.tsx` (new)
- Bottom drawer/modal filtered to tops only (excluding overlays)
- Reuses product grid from catalog
- On select: updates `baseLayer` in store, closes drawer

#### `look-builder.tsx`
- When overlay selected: show base layer mini-card with "base" label above the overlay slot
- Both share the "tops" visual group

#### `category-filter.tsx`
- No changes to tabs — overlays included in "Parte de Cima" filter
- `getProducts` API returns overlays when `category=tops`

### 5. Pipeline (`app/api/try-on/route.ts`)

- When items include an overlay:
  - Insert base layer as first step with `category: "tops"`
  - Overlay follows as second step with `category: "tops"`
- Pipeline order: `base(tops) → overlay(tops) → bottoms → shoes`
- +1 Fashn credit, +~50s processing time

### 6. Progress (`try-on-progress.tsx`)

- New icon for overlay steps: 🧥
- Step labels: "Vestindo base..." → "Aplicando blazer..."
- Step count reflects extra step

### 7. Polling (`app/api/try-on/[id]/route.ts`)

- Step labels map updated with overlay-specific labels
- No structural changes to polling logic

## File Impact

| File | Change Type |
|------|-------------|
| `src/types/index.ts` | Modify — add overlays category |
| `src/lib/nuvemshop.ts` | Modify — blazer detection, overlay in tops filter |
| `src/store/use-tryon-store.ts` | Modify — baseLayer state + auto-select logic |
| `src/components/product-card.tsx` | Modify — overlay badge |
| `src/components/look-builder.tsx` | Modify — base + overlay group display |
| `src/components/try-on-progress.tsx` | Modify — overlay step icon/label |
| `src/app/api/try-on/route.ts` | Modify — insert base layer step |
| `src/app/api/try-on/[id]/route.ts` | Modify — overlay step labels |
| `src/components/base-layer-toast.tsx` | New — auto-dismiss toast |
| `src/components/base-picker-drawer.tsx` | New — base selection drawer |

## Edge Cases

- **No t-shirts in catalog**: Skip base layer, run overlay alone (graceful degradation)
- **Base already selected as top**: Move existing top to base, no auto-fetch
- **Multiple overlays**: Not supported — only one overlay at a time (blazer replaces blazer)
- **Remove base while overlay active**: Auto-select new base
