// In-memory lead storage (per serverless instance)
// For production persistence, consider a database

interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
}

const leads = new Map<string, Lead>();

export function saveLead(email: string, phone: string) {
  const key = email.toLowerCase().trim();
  const existing = leads.get(key);

  if (existing) {
    existing.phone = phone;
    return;
  }

  leads.set(key, {
    email: key,
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
    tryOnCount: 0,
    lastTryOn: null,
  });
}

export function incrementLeadTryOn(email: string) {
  const key = email.toLowerCase().trim();
  const lead = leads.get(key);
  if (lead) {
    lead.tryOnCount++;
    lead.lastTryOn = new Date().toISOString();
  }
}

export function getLeads() {
  return Array.from(leads.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
