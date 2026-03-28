import { loadFromBlob, flushToBlob } from "./persistence";

interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
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

export async function getLeads() {
  await init();
  return Array.from(leads.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
