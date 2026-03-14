const FASHN_BASE = "https://api.fashn.ai/v1";

function getApiKey(): string {
  const key = process.env.FASHN_API_KEY;
  if (!key) throw new Error("FASHN_API_KEY não configurada");
  return key;
}

// Map internal category names to Fashn API category values
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    tops: "tops",
    bottoms: "bottoms",
    shoes: "auto",
  };
  return categoryMap[category] || "auto";
}

export async function startTryOn(
  modelImageUrl: string,
  garmentImageUrl: string,
  category?: string
): Promise<{ id: string; error: string | null }> {
  const res = await fetch(`${FASHN_BASE}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model_name: "tryon-max",
      inputs: {
        model_image: modelImageUrl,
        product_image: garmentImageUrl,
        output_format: "jpeg",
        num_images: 1,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fashn API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function pollTryOnStatus(
  id: string
): Promise<{
  id: string;
  status: string;
  output?: string[];
  error?: string | null;
}> {
  const res = await fetch(`${FASHN_BASE}/status/${id}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!res.ok) {
    throw new Error(`Fashn poll error ${res.status}`);
  }

  return res.json();
}

// Aggressive polling: checks Fashn multiple times within a single call
// to detect completion faster (reduces inter-step latency by up to 6s)
export async function aggressivePoll(
  id: string,
  maxChecks = 6,
  intervalMs = 1000
): Promise<{
  id: string;
  status: string;
  output?: string[];
  error?: string | null;
}> {
  for (let i = 0; i < maxChecks; i++) {
    const result = await pollTryOnStatus(id);

    if (result.status === "completed" || result.status === "failed") {
      return result;
    }

    // Don't wait after the last check
    if (i < maxChecks - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  // Return the last status (still processing)
  return pollTryOnStatus(id);
}

export async function waitForCompletion(
  id: string,
  maxAttempts = 120,
  intervalMs = 3000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollTryOnStatus(id);

    if (result.status === "completed" && result.output?.[0]) {
      return result.output[0];
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Try-on falhou");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Timeout aguardando resultado do try-on");
}

export async function runTryOnPipeline(
  photoUrl: string,
  garmentUrls: { category: string; imageUrl: string }[],
  onStep?: (step: number, total: number, label: string) => void
): Promise<string> {
  let currentModelImage = photoUrl;
  const labels: Record<string, string> = {
    tops: "Vestindo parte de cima...",
    bottoms: "Vestindo parte de baixo...",
    shoes: "Calçando...",
  };

  for (let i = 0; i < garmentUrls.length; i++) {
    const { category, imageUrl } = garmentUrls[i];
    const label = labels[category] || `Aplicando peça ${i + 1}...`;

    onStep?.(i + 1, garmentUrls.length, label);

    const { id, error } = await startTryOn(currentModelImage, imageUrl, category);
    if (error) throw new Error(error);

    currentModelImage = await waitForCompletion(id);
  }

  return currentModelImage;
}

export async function getCreditsBalance(): Promise<number> {
  const res = await fetch(`${FASHN_BASE}/credits`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!res.ok) return -1;
  const data = await res.json();
  return data.credits ?? data.balance ?? -1;
}
