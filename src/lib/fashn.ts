const FASHN_BASE = "https://api.fashn.ai/v1";

function getApiKey(): string {
  const key = process.env.FASHN_API_KEY;
  if (!key) throw new Error("FASHN_API_KEY não configurada");
  return key;
}

export async function startTryOn(
  modelImageUrl: string,
  productImageUrl: string,
  prompt?: string
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
        product_image: productImageUrl,
        output_format: "jpeg",
        num_images: 1,
        ...(prompt && { prompt }),
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

    const { id, error } = await startTryOn(currentModelImage, imageUrl);
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
