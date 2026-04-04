import { loadFromBlob, flushToBlob } from "./persistence";

export interface LeadEvent {
  type: "signup" | "photo_upload" | "product_selected" | "product_removed"
      | "tryon_started" | "tryon_completed" | "tryon_failed"
      | "buy_click" | "rating" | "download";
  data?: Record<string, string | number>;
  ts: number;
}

interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
  events: LeadEvent[];
}

const leads = new Map<string, Lead>();
let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const data = await loadFromBlob<Record<string, Lead>>("leads");
      if (data) {
        for (const [key, lead] of Object.entries(data)) {
          if (!leads.has(key)) {
            leads.set(key, lead);
          }
        }
      }
    })();
  }
  return initPromise;
}

function flush() {
  flushToBlob("leads", () => Object.fromEntries(leads));
}

export async function saveLead(email: string, phone: string) {
  await init();

  const key = email.toLowerCase().trim();
  const existing = leads.get(key);

  if (existing) {
    existing.phone = phone;
    flush();
    return;
  }

  leads.set(key, {
    email: key,
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
    tryOnCount: 0,
    lastTryOn: null,
    events: [{ type: "signup", ts: Date.now() }],
  });

  flush();
}

export async function incrementLeadTryOn(email: string) {
  await init();

  const key = email.toLowerCase().trim();
  const lead = leads.get(key);
  if (lead) {
    lead.tryOnCount++;
    lead.lastTryOn = new Date().toISOString();
    flush();
  }
}

const MAX_EVENTS_PER_LEAD = 100;

export async function trackLeadEvent(email: string, event: Omit<LeadEvent, "ts">) {
  await init();

  const key = email.toLowerCase().trim();
  const lead = leads.get(key);
  if (!lead) return;

  if (!lead.events) lead.events = [];
  lead.events.push({ ...event, ts: Date.now() });
  if (lead.events.length > MAX_EVENTS_PER_LEAD) {
    lead.events = lead.events.slice(-MAX_EVENTS_PER_LEAD);
  }

  flush();
}

export async function getLeads() {
  await init();
  return Array.from(leads.values())
    .map((l) => ({ ...l, events: l.events || [] }))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
