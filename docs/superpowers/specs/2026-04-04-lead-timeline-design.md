# Lead Timeline — Design Spec

## Overview

Add per-lead event tracking and a timeline modal to the admin dashboard. Currently, all analytics events are aggregated globally — this feature links events to individual leads so admins can see the complete journey of each customer.

## Data Model

### LeadEvent

```typescript
interface LeadEvent {
  type: "signup" | "photo_upload" | "product_selected" | "product_removed"
      | "tryon_started" | "tryon_completed" | "tryon_failed"
      | "buy_click" | "rating" | "download";
  data?: Record<string, string | number>;
  ts: number; // Date.now()
}
```

Event data examples:
- `signup` — no extra data
- `photo_upload` — `{ sizeKb: 450 }`
- `product_selected` — `{ productId: 123, productName: "Camiseta Polo", category: "tops" }`
- `product_removed` — `{ productId: 123, productName: "Camiseta Polo", category: "tops" }`
- `tryon_started` — `{ steps: 3 }`
- `tryon_completed` — `{ durationMs: 87000, steps: 3 }`
- `tryon_failed` — `{ error: "timeout" }`
- `buy_click` — `{ productId: 123, productName: "Camiseta Polo" }`
- `rating` — `{ value: "up" }`
- `download` — no extra data

Cap: 100 events per lead (FIFO).

### Lead Interface (extended)

```typescript
interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
  events: LeadEvent[]; // NEW
}
```

Storage: same Blob persistence as current leads (`leads` key). Events array added to each lead entry.

## Capture Points

| Event | Source | Mechanism |
|-------|--------|-----------|
| `signup` | `POST /api/leads` | Server — `saveLead()` |
| `photo_upload` | `POST /api/upload` | Server — after Blob upload |
| `product_selected` | Store `selectItem()` | Client → `POST /api/track-lead-event` |
| `product_removed` | Store `removeItem()` | Client → `POST /api/track-lead-event` |
| `tryon_started` | `POST /api/try-on` | Server — inline |
| `tryon_completed` | `POST /api/try-on` | Server — inline, with duration |
| `tryon_failed` | `POST /api/try-on` | Server — catch block |
| `buy_click` | `POST /api/track-buy` | Server — add email param |
| `rating` | `POST /api/track-event` | Server — add email param |
| `download` | `BuyLookCta` | Client → `POST /api/track-lead-event` |

### New endpoint

`POST /api/track-lead-event` — receives `{ email, type, data? }` for client-side events. Fire-and-forget from client.

### Modified endpoints

- `POST /api/track-buy` — accept optional `email` field, track event on lead
- `POST /api/track-event` — accept optional `email` field for rating events

## Admin UI — Timeline Modal

Trigger: click on any lead row in leads-tab table.

### Modal layout

**Header:**
- Email + phone (WhatsApp link)
- Registration date + relative time ("ha X dias")
- Total try-ons + total buy clicks (derived from events)
- Status badge: novo (0 tryons), ativo (tryon in last 7d), inativo (no tryon in 7d+)

**Body — Timeline:**
- Vertical chronological list, newest first
- Each event: icon + description + relative timestamp
- Color coding: green (buy/conversion), teal (try-on), gray (navigation/selection), red (error)
- Day grouping headers: "Hoje", "Ontem", "28 Mar"

**Footer:**
- WhatsApp direct link button
- Copy timeline as text button

### Event display

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| signup | user-plus | gray | "Cadastrou-se" |
| photo_upload | camera | gray | "Enviou foto (450KB)" |
| product_selected | plus | teal | "Selecionou Camiseta Polo (tops)" |
| product_removed | minus | gray | "Removeu Camiseta Polo (tops)" |
| tryon_started | play | teal | "Iniciou try-on (3 pecas)" |
| tryon_completed | check | green | "Try-on concluido (87s)" |
| tryon_failed | x | red | "Try-on falhou: timeout" |
| buy_click | shopping-cart | green | "Clicou comprar Camiseta Polo" |
| rating | thumb | teal | "Avaliou: positivo" |
| download | download | gray | "Baixou imagem do resultado" |

## Files to modify

### Backend
- `src/lib/leads.ts` — add events array, `trackLeadEvent()` function
- `src/app/api/leads/route.ts` — track signup event
- `src/app/api/try-on/route.ts` — track tryon_started, tryon_completed, tryon_failed
- `src/app/api/track-buy/route.ts` — accept email, track buy_click event
- `src/app/api/track-event/route.ts` — accept email, track rating event
- `src/app/api/track-lead-event/route.ts` — NEW endpoint for client events

### Frontend
- `src/app/admin/types.ts` — add LeadEvent type, update Lead interface
- `src/app/admin/components/leads-tab.tsx` — add click handler to open modal
- `src/app/admin/components/lead-timeline-modal.tsx` — NEW modal component
- `src/store/use-tryon-store.ts` — send events on selectItem, removeItem
- `src/components/buy-look-cta.tsx` — send download event + pass email to track-buy
- `src/components/photo-upload.tsx` — check if photo_upload event already tracked server-side

### Types
- `src/types/index.ts` or inline — LeadEvent type shared between lib and admin
